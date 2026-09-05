package com.company.app.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public record RegisterRequest(
        @NotBlank String username,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6, max = 100) String password,
        @JsonProperty("role")
        String role
) {
        @JsonCreator
        public RegisterRequest(
                        @JsonProperty("username") @JsonAlias({"name", "fullName"}) String username,
                        @JsonProperty("email") String email,
                        @JsonProperty("password") String password,
                        @JsonProperty("role") String role
        ) {
                this.username = username;
                this.email = email;
                this.password = password;
                this.role = role;
        }
}
