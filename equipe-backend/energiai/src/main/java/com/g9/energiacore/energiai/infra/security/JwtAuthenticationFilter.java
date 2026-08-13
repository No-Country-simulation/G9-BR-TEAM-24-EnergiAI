package com.g9.energiacore.energiai.infra.security;

import com.g9.energiacore.energiai.domain.User;
import com.g9.energiacore.energiai.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final UserRepository userRepository;

  public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    final String authHeader = request.getHeader("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    final String jwt = authHeader.substring(7);
    try {
      final String userEmail = jwtService.extractEmail(jwt);

      if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        Optional<User> userOptional = userRepository.findByEmail(userEmail);

        if (userOptional.isPresent() && jwtService.isTokenValid(jwt, userEmail)) {
          User user = userOptional.get();
          UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
              user.getEmail(),
              null,
              Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
          authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authToken);
        }
      }
    } catch (Exception e) {
      logger.warn("Não foi possível autenticar a requisição via JWT: " + e.getMessage());
    }

    filterChain.doFilter(request, response);
  }
}
