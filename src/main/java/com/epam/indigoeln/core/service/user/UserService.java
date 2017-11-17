package com.epam.indigoeln.core.service.user;

import com.epam.indigoeln.core.model.Role;
import com.epam.indigoeln.core.model.User;
import com.epam.indigoeln.core.repository.role.RoleRepository;
import com.epam.indigoeln.core.repository.user.UserRepository;
import com.epam.indigoeln.core.security.SecurityUtils;
import com.epam.indigoeln.core.service.exception.DuplicateFieldException;
import com.epam.indigoeln.core.service.exception.EntityNotFoundException;
import com.epam.indigoeln.core.service.exception.OperationDeniedException;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Service class for managing users.
 */
@Service
public class UserService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private SessionRegistry sessionRegistry;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    /**
     * Gets users from DB according to given pagination information
     *
     * @param pageable pagination information to retrieve users
     * @return page with found users
     */
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * Gets all users from DB
     *
     * @return list of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Saves new user in DB
     *
     * @param user user to save
     * @return created user
     */
    public User createUser(User user) {
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);
        user.setActivated(user.getActivated());
        user.setId(user.getLogin());

        // checking for roles existence
        user.setRoles(checkRolesExistenceAndGet(user.getRoles()));

        User savedUser;
        try {
            savedUser = userRepository.save(user);
        } catch (DuplicateKeyException e) {
            LOGGER.error("Duplicate key detected", e);
            throw DuplicateFieldException.createWithUserLogin(user.getLogin());
        }
        LOGGER.debug("Created Information for User: {}", savedUser);

        return savedUser;
    }

    /**
     * Updates user information in DB
     *
     * @param user user to update
     * @param executingUser user performing action
     * @return updated user
     */
    public User updateUser(User user, User executingUser) {
        User userFromDB = userRepository.findOneByLogin(user.getLogin());
        if (userFromDB == null) {
            throw EntityNotFoundException.createWithUserLogin(user.getLogin());
        }
        if (userFromDB.isSystem()) {
            throw new IllegalArgumentException("Cannot update system user.");
        }
        // encoding of user's password, or getting from DB entity
        String encryptedPassword;
        if (!Strings.isNullOrEmpty(user.getPassword())) {
            encryptedPassword = passwordEncoder.encode(user.getPassword());
        } else {
            encryptedPassword = userFromDB.getPassword();
        }
        user.setPassword(encryptedPassword);

        // checking for roles existence and for disallowed operation for current user
        user.setRoles(checkRolesExistenceAndGet(user.getRoles()));
        if(user.getId().equals(executingUser.getId()) &&
                (user.getRoles().size() != executingUser.getRoles().size()
                        || !user.getRoles().containsAll(executingUser.getRoles()))) {
            throw OperationDeniedException.createUserDeleteOperation(executingUser.getId());
        }

        User savedUser = userRepository.save(user);
        LOGGER.debug("Created Information for User: {}", savedUser);

        // check for significant changes and perform logout for user
        SecurityUtils.checkAndLogoutUser(savedUser, sessionRegistry);
        return user;
    }

    /**
     * Deletes the user from DB if the user exists and it is allowed to delete that user.
     * It is not allowed to delete system users and user cannot delete himself.
     *
     * @param login login of the user to delete
     * @param executingUser user performing action
     */
    public void deleteUserByLogin(String login, User executingUser) {
        User userByLogin = userRepository.findOneByLogin(login);
        if (userByLogin == null) {
            throw EntityNotFoundException.createWithUserLogin(login);
        }
        if (userByLogin.isSystem()) {
            throw new IllegalArgumentException("Cannot delete system user.");
        }
        // checking for disallowed operation for current user
        if (userByLogin.getId().equals(executingUser.getId())) {
            throw OperationDeniedException.createUserDeleteOperation(executingUser.getId());
        }

        //TODO check for projects, notebooks, experiments with him and use AlreadyInUseException

        userRepository.delete(userByLogin);
        LOGGER.debug("Deleted User: {}", userByLogin);
    }

    /**
     * Gets current user from DB with eagerly loaded authorities
     *
     * @return current user
     */
    public User getUserWithAuthorities() {
        User user = userRepository.findOneByLogin(SecurityUtils.getCurrentUser().getUsername());
        user.getRoles().size(); // eagerly load the association
        return user;
    }

    /**
     * Gets user from DB by ID with eagerly loaded authorities
     *
     * @param id user ID
     * @return user with given ID
     */
    public User getUserWithAuthorities(String id) {
        User user = userRepository.findOne(id);
        if (user == null) {
            throw EntityNotFoundException.createWithUserId(id);
        }

        user.getRoles().size(); // eagerly load the association
        return user;
    }

    /**
     * Gets user from DB by login with eagerly loaded authorities
     *
     * @param login login of the user
     * @return user with given login
     */
    public User getUserWithAuthoritiesByLogin(String login) {
        User user = userRepository.findOneByLogin(login);
        if (user == null) {
            throw EntityNotFoundException.createWithUserLogin(login);
        }

        user.getRoles().size(); // eagerly load the association
        return user;
    }

    private Set<Role> checkRolesExistenceAndGet(Set<Role> roles) {
        Set<Role> checkedRoles = new HashSet<>(roles.size());
        for (Role role : roles) {
            Role roleFromDB = roleRepository.findOne(role.getId());
            if (roleFromDB == null) {
                throw EntityNotFoundException.createWithRoleId(role.getId());
            }
            checkedRoles.add(roleFromDB);
        }

        return checkedRoles;
    }
}