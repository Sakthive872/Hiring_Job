package com.company.app.service;

import com.company.app.dto.auth.AuthResponse;
import com.company.app.dto.auth.LoginRequest;
import com.company.app.dto.auth.RefreshTokenRequest;
import com.company.app.dto.auth.RegisterRequest;
import com.company.app.dto.user.UserResponse;
import com.company.app.exception.DuplicateResourceException;
import com.company.app.exception.ResourceNotFoundException;
import com.company.app.model.Profile;
import com.company.app.model.Role;
import com.company.app.model.User;
import com.company.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String username = request.username().trim();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username already taken");
        }

        User user = User.builder()
                .email(email)
                .username(username)
                .password(passwordEncoder.encode(request.password()))
                .roles(resolveRole(request.role()))
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        Profile profile = Profile.builder().user(saved).build();
        saved.setProfile(profile);
        User persisted = userRepository.save(saved);

        return buildAuthResponse(persisted);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("Invalid credentials");
        }
        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String email = jwtService.extractUsername(request.refreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String accessToken = jwtService.generateToken(user);
        return new AuthResponse(accessToken, request.refreshToken(), "Bearer", jwtService.getExpirationMs(), userService.mapUser(user));
    }

    public String logout() {
        return "Logged out successfully";
    }

    public UserResponse me() {
        return userService.mapUser(userService.getCurrentUser());
    }

    private AuthResponse buildAuthResponse(User user) {
        String access = jwtService.generateToken(user);
        String refresh = jwtService.generateRefreshToken(user);
        return new AuthResponse(access, refresh, "Bearer", 86400000L, userService.mapUser(user));
    }

    private Set<Role> resolveRole(String roleInput) {
        Role role = Role.fromInput(roleInput);
        return Set.of(role);
    }
}
