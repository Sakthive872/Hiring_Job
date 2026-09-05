package com.company.app.service;

import com.company.app.dto.message.ConversationResponse;
import com.company.app.dto.message.MessageDto;
import com.company.app.exception.BusinessRuleException;
import com.company.app.exception.ResourceNotFoundException;
import com.company.app.model.Conversation;
import com.company.app.model.Message;
import com.company.app.model.User;
import com.company.app.repository.ConversationRepository;
import com.company.app.repository.MessageRepository;
import com.company.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public MessageDto sendMessage(Long recipientId, String content) {
        User sender = userService.getCurrentUser();
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));
        if (sender.getId().equals(recipient.getId())) {
            throw new BusinessRuleException("Cannot message yourself");
        }

        Conversation conversation = conversationRepository.findConversationBetween(sender.getId(), recipient.getId())
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .userOne(sender)
                        .userTwo(recipient)
                        .build()));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .build();
        Message saved = messageRepository.save(message);
        conversation.setUpdatedAt(saved.getCreatedAt());
        conversationRepository.save(conversation);

        notificationService.createNotification(recipient, sender, "MESSAGE", sender.getUsername() + " sent you a message", "MESSAGE", saved.getId());
        return mapMessage(saved);
    }

    public List<ConversationResponse> getConversations() {
        User current = userService.getCurrentUser();
        List<Conversation> conversations = conversationRepository.findByUserId(current.getId());
        List<ConversationResponse> responses = new ArrayList<>();
        for (Conversation c : conversations) {
            User participant = c.getUserOne().getId().equals(current.getId()) ? c.getUserTwo() : c.getUserOne();
            List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());
            String lastMessage = messages.isEmpty() ? "" : messages.get(messages.size() - 1).getContent();
            responses.add(new ConversationResponse(c.getId(), participant.getId(), participant.getUsername(), lastMessage, c.getUpdatedAt(), messages.stream().map(this::mapMessage).toList()));
        }
        responses.sort(Comparator.comparing(ConversationResponse::updatedAt).reversed());
        return responses;
    }

    public List<MessageDto> getMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream().map(this::mapMessage).toList();
    }

    private MessageDto mapMessage(Message message) {
        return new MessageDto(
                message.getId(),
                message.getConversation() != null ? message.getConversation().getId() : null,
                message.getSender() != null ? message.getSender().getId() : null,
                message.getSender() != null ? message.getSender().getUsername() : null,
                message.getContent(),
                message.getCreatedAt()
        );
    }
}
