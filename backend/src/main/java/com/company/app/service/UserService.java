package com.company.app.service;

import com.company.app.dto.profile.ProfileResponse;
import com.company.app.dto.user.UserResponse;
import com.company.app.dto.user.UserUpdateRequest;
import com.company.app.exception.ResourceNotFoundException;
import com.company.app.exception.UnauthorizedException;
import com.company.app.model.Profile;
import com.company.app.model.Role;
import com.company.app.model.User;
import com.company.app.repository.UserRepository;
import com.company.app.repository.ConnectionRepository;
import com.company.app.model.ConnectionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Authentication required");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    public UserResponse getUserResponse(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        return mapUser(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User currentUser = getCurrentUser();
        if (!currentUser.getId().equals(id) && !isUserAdmin(currentUser)) {
            throw new UnauthorizedException("You are not allowed to update this user account");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        if (!user.getEmail().equals(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }
        user.setEmail(request.email());
        user.setUsername(request.username());
        return mapUser(userRepository.save(user));
    }

    public ProfileResponse toProfileResponse(Profile profile) {
        if (profile == null) {
            return null;
        }
        return new ProfileResponse(
                profile.getId(),
                profile.getUser() != null ? profile.getUser().getId() : null,
                profile.getHeadline(),
                profile.getSummary(),
                profile.getLocation(),
                profile.getWebsite(),
                profile.getExperiences() == null ? java.util.List.of() : profile.getExperiences().stream()
                        .map(exp -> new com.company.app.dto.profile.ExperienceDto(
                                exp.getId(),
                                exp.getTitle(),
                                exp.getCompanyName(),
                                exp.getEmploymentType() == null ? null : exp.getEmploymentType().name(),
                                exp.getStartDate(),
                                exp.getEndDate(),
                                exp.getDescription()))
                        .toList(),
                profile.getEducations() == null ? java.util.List.of() : profile.getEducations().stream()
                        .map(edu -> new com.company.app.dto.profile.EducationDto(
                                edu.getId(),
                                edu.getSchool(),
                                edu.getDegree(),
                                edu.getFieldOfStudy(),
                                edu.getStartDate(),
                                edu.getEndDate(),
                                edu.getDescription()))
                        .toList(),
                profile.getSkills() == null ? java.util.List.of() : profile.getSkills().stream()
                        .map(skill -> new com.company.app.dto.profile.SkillDto(skill.getId(), skill.getName()))
                        .toList(),
                profile.getConnectionsCount(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    public UserResponse mapUser(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRoles(),
                user.isEnabled(),
                connectionRepository.countByUserAndStatus(user.getId(), ConnectionStatus.ACCEPTED),
                user.getCreatedAt(),
                user.getProfile() != null ? toProfileResponse(user.getProfile()) : null
        );
    }

    public boolean isUserAdmin(User user) {
        return user.getRoles().contains(Role.ROLE_ADMIN);
    }

    public boolean isUserRecruiter(User user) {
        Set<Role> roles = user.getRoles();
        return roles.contains(Role.ROLE_RECRUITER) || roles.contains(Role.ROLE_COMPANY_ADMIN) || roles.contains(Role.ROLE_ADMIN);
    }
}
