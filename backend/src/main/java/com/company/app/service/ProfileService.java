package com.company.app.service;

import com.company.app.dto.profile.EducationDto;
import com.company.app.dto.profile.ExperienceDto;
import com.company.app.dto.profile.ProfileResponse;
import com.company.app.dto.profile.SkillDto;
import com.company.app.exception.ResourceNotFoundException;
import com.company.app.exception.UnauthorizedException;
import com.company.app.model.Education;
import com.company.app.model.Experience;
import com.company.app.model.Profile;
import com.company.app.model.Skill;
import com.company.app.model.User;
import com.company.app.repository.ProfileRepository;
import com.company.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public ProfileResponse getProfile(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user " + userId));
        return map(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, ProfileResponse input) {
        User currentUser = userService.getCurrentUser();
        if (!currentUser.getId().equals(userId) && !userService.isUserAdmin(currentUser)) {
            throw new UnauthorizedException("You are not allowed to update this profile");
        }

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                    Profile newProfile = Profile.builder().user(user).build();
                    return profileRepository.save(newProfile);
                });

        profile.setHeadline(input.headline());
        profile.setSummary(input.summary());
        profile.setLocation(input.location());
        profile.setWebsite(input.website());

        List<Experience> experiences = new ArrayList<>();
        for (ExperienceDto dto : input.experiences() == null ? List.<ExperienceDto>of() : input.experiences()) {
            Experience exp = Experience.builder()
                    .profile(profile)
                    .title(dto.title())
                    .companyName(dto.companyName())
                    .employmentType(dto.employmentType() == null ? null : com.company.app.model.EmploymentType.valueOf(dto.employmentType()))
                    .startDate(dto.startDate())
                    .endDate(dto.endDate())
                    .description(dto.description())
                    .build();
            experiences.add(exp);
        }
        profile.getExperiences().clear();
        profile.getExperiences().addAll(experiences);

        List<Education> educations = new ArrayList<>();
        for (EducationDto dto : input.educations() == null ? List.<EducationDto>of() : input.educations()) {
            Education edu = Education.builder()
                    .profile(profile)
                    .school(dto.school())
                    .degree(dto.degree())
                    .fieldOfStudy(dto.fieldOfStudy())
                    .startDate(dto.startDate())
                    .endDate(dto.endDate())
                    .description(dto.description())
                    .build();
            educations.add(edu);
        }
        profile.getEducations().clear();
        profile.getEducations().addAll(educations);

        List<Skill> skills = new ArrayList<>();
        for (SkillDto dto : input.skills() == null ? List.<SkillDto>of() : input.skills()) {
            Skill skill = Skill.builder().profile(profile).name(dto.name()).build();
            skills.add(skill);
        }
        profile.getSkills().clear();
        profile.getSkills().addAll(skills);

        return map(profileRepository.save(profile));
    }

    private ProfileResponse map(Profile profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getUser() != null ? profile.getUser().getId() : null,
                profile.getHeadline(),
                profile.getSummary(),
                profile.getLocation(),
                profile.getWebsite(),
                profile.getExperiences().stream().map(e -> new ExperienceDto(
                        e.getId(),
                        e.getTitle(),
                        e.getCompanyName(),
                        e.getEmploymentType() == null ? null : e.getEmploymentType().name(),
                        e.getStartDate(),
                        e.getEndDate(),
                        e.getDescription())).toList(),
                profile.getEducations().stream().map(e -> new EducationDto(
                        e.getId(),
                        e.getSchool(),
                        e.getDegree(),
                        e.getFieldOfStudy(),
                        e.getStartDate(),
                        e.getEndDate(),
                        e.getDescription())).toList(),
                profile.getSkills().stream().map(s -> new SkillDto(s.getId(), s.getName())).toList(),
                profile.getConnectionsCount(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
