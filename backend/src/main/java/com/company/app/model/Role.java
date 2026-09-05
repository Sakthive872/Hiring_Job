package com.company.app.model;

public enum Role {
    ROLE_CANDIDATE,
    ROLE_RECRUITER,
    ROLE_COMPANY_ADMIN,
    ROLE_ADMIN;

    public static Role fromInput(String value) {
        if (value == null || value.isBlank()) {
            return ROLE_CANDIDATE;
        }

        String normalized = value.trim()
                .replace('-', '_')
                .replace(' ', '_')
                .replace('.', '_');

        // Accept values both with and without the ROLE_ prefix and map unknown values explicitly
        if (normalized.startsWith("ROLE_")) {
            // remove prefix and fall through to mapping logic below
            normalized = normalized.substring(5);
        }

        String upper = normalized.toUpperCase();
        return switch (upper) {
            case "CANDIDATE", "ROLE_CANDIDATE" -> ROLE_CANDIDATE;
            case "RECRUITER", "ROLE_RECRUITER" -> ROLE_RECRUITER;
            case "COMPANY_ADMIN", "COMPANYADMIN", "ROLE_COMPANY_ADMIN" -> ROLE_COMPANY_ADMIN;
            case "ADMIN", "ROLE_ADMIN" -> ROLE_ADMIN;
            case "USER", "ROLE_USER" -> ROLE_CANDIDATE; // treat USER as candidate by default
            default -> throw new IllegalArgumentException("Unsupported user type: " + value);
        };
    }
}
