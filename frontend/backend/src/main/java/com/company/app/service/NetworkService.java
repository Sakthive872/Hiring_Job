package com.company.app.service;

import com.company.app.dto.network.ConnectionRequestDto;
import com.company.app.dto.network.ConnectionResponse;
import com.company.app.exception.BusinessRuleException;
import com.company.app.exception.DuplicateResourceException;
import com.company.app.exception.ResourceNotFoundException;
import com.company.app.model.Connection;
import com.company.app.model.ConnectionStatus;
import com.company.app.model.User;
import com.company.app.model.Profile;
import com.company.app.repository.ConnectionRepository;
import com.company.app.repository.UserRepository;
import com.company.app.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NetworkService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final com.company.app.repository.ProfileRepository profileRepository;

    @Transactional
    public ConnectionResponse sendRequest(ConnectionRequestDto request) {
        User requester = userService.getCurrentUser();
        User recipient = userRepository.findById(request.recipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        if (requester.getId().equals(recipient.getId())) {
            throw new BusinessRuleException("You cannot connect with yourself");
        }
        if (connectionRepository.findByRequesterIdAndRecipientId(requester.getId(), recipient.getId()).isPresent()
            || connectionRepository.findByRequesterIdAndRecipientId(recipient.getId(), requester.getId()).isPresent()) {
            throw new DuplicateResourceException("Connection request already exists");
        }

        Connection connection = Connection.builder()
                .requester(requester)
                .recipient(recipient)
                .status(ConnectionStatus.PENDING)
                .build();
        Connection saved = connectionRepository.save(connection);
        return mapToResponse(saved);
    }

    public List<ConnectionResponse> listConnections(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return connectionRepository.findByUser(user.getId()).stream().map(this::mapToResponse).toList();
    }

    public List<com.company.app.dto.user.UserResponse> listProfiles() {
        Long currentUserId = userService.getCurrentUser().getId();
        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(userService::mapUser)
                .toList();
    }

    @Transactional
    public ConnectionResponse updateStatus(Long connectionId, ConnectionStatus status) {
        User current = userService.getCurrentUser();
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection not found"));
        if (!connection.getRecipient().getId().equals(current.getId())) {
            throw new BusinessRuleException("Only the recipient can update this connection state");
        }
        if (status != ConnectionStatus.ACCEPTED && status != ConnectionStatus.REJECTED) {
            throw new BusinessRuleException("Invalid status transition");
        }
        connection.setStatus(status);
        Connection saved = connectionRepository.save(connection);

        // If accepted, increment connectionsCount on both profiles for quick reads
        if (status == ConnectionStatus.ACCEPTED) {
            User requester = saved.getRequester();
            User recipient = saved.getRecipient();

            // Ensure profiles exist
            Profile requesterProfile = requester.getProfile();
            if (requesterProfile == null) {
                requesterProfile = Profile.builder().user(requester).connectionsCount(1L).build();
                profileRepository.save(requesterProfile);
                requester.setProfile(requesterProfile);
                userRepository.save(requester);
            } else {
                requesterProfile.setConnectionsCount(requesterProfile.getConnectionsCount() + 1);
                profileRepository.save(requesterProfile);
            }

            Profile recipientProfile = recipient.getProfile();
            if (recipientProfile == null) {
                recipientProfile = Profile.builder().user(recipient).connectionsCount(1L).build();
                profileRepository.save(recipientProfile);
                recipient.setProfile(recipientProfile);
                userRepository.save(recipient);
            } else {
                recipientProfile.setConnectionsCount(recipientProfile.getConnectionsCount() + 1);
                profileRepository.save(recipientProfile);
            }
        }

        return mapToResponse(saved);
    }

    private ConnectionResponse mapToResponse(Connection c) {
        return new ConnectionResponse(
                c.getId(),
                c.getRequester().getId(),
                c.getRecipient().getId(),
                c.getRequester().getUsername(),
                c.getRecipient().getUsername(),
                c.getStatus(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
