package com.epam.indigoeln.core.repository.signature;

import com.epam.indigoeln.config.signature.SignatureProperties;
import lombok.EqualsAndHashCode;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Repository;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Repository
public class SignatureRepository {

    private static final Logger LOGGER = LoggerFactory.getLogger(SignatureRepository.class);

    @Autowired
    private SignatureProperties signatureProperties;

    private final Object signatureSessionIdLock = new Object();
    private String signatureSessionId;

    private RestTemplate restTemplate = new RestTemplate();

    public String getReasons() {
        return exchange(signatureProperties.getUrl() + "/api/getReasons", HttpMethod.GET, null,
                String.class, new HashMap<>()).getBody();
    }

    public String getStatuses() {
        return exchange(signatureProperties.getUrl() + "/api/getStatuses", HttpMethod.GET, null,
                String.class, new HashMap<>()).getBody();
    }

    public String getFinalStatus() {
        return exchange(signatureProperties.getUrl() + "/api/getFinalStatus", HttpMethod.GET, null,
                String.class, new HashMap<>()).getBody();
    }

    public String getSignatureTemplates(String username) {
        return exchange(signatureProperties.getUrl() + "/api/getTemplates?username={username}", HttpMethod.GET, null,
                String.class, Collections.singletonMap("username", username)).getBody();
    }

    public String uploadDocument(String username, String templateId, final String fileName, byte[] file) {
        if (StringUtils.isBlank(username) || StringUtils.isBlank(templateId)) {
            return StringUtils.EMPTY;
        }

        LinkedMultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
        map.add("username", username);
        map.add("templateId", templateId);
        ByteArrayResource fileResource = new ByteArrayResourceImpl(file, fileName);
        map.add("file", fileResource);

        return exchange(signatureProperties.getUrl() + "/api/uploadDocument", HttpMethod.POST, map,
                String.class, new HashMap<>()).getBody();
    }

    public String getDocumentInfo(String documentId) {
        if (StringUtils.isBlank(documentId)) {
            return StringUtils.EMPTY;
        }

        try {
            return exchange(signatureProperties.getUrl() + "/api/getDocumentInfo?id={id}", HttpMethod.GET, null,
                    String.class, Collections.singletonMap("id", documentId)).getBody();
        } catch (Exception e) {
            LOGGER.error("Couldn't get document info, document id = " + documentId, e);
            return StringUtils.EMPTY;
        }
    }

    public String getDocumentsInfo(Collection<String> documentIds) {
        if (CollectionUtils.isEmpty(documentIds)) {
            return org.apache.commons.lang3.StringUtils.EMPTY;
        }

        try {
            return exchange(signatureProperties.getUrl() + "/api/getDocumentsByIds", HttpMethod.POST,
                    Collections.singletonMap("documentsIds", documentIds), String.class, new HashMap<>()).getBody();
        } catch (Exception e) {
            LOGGER.error("Couldn't get documents info, document ids = " + documentIds.stream().reduce("", (s1, s2) -> s1 + ", " + s2), e);
            return StringUtils.EMPTY;
        }
    }

    public String getDocuments(String username) {
        if (StringUtils.isBlank(username)) {
            return StringUtils.EMPTY;
        }

        try {
            return exchange(signatureProperties.getUrl() + "/api/getDocuments?username={username}", HttpMethod.GET, null,
                    String.class, Collections.singletonMap("username", username)).getBody();
        } catch (Exception e) {
            LOGGER.error("Couldn't get documents, username = " + username, e);
            return StringUtils.EMPTY;
        }
    }

    public byte[] downloadDocument(String documentId) {
        if (StringUtils.isBlank(documentId)) {
            return new byte[0];
        }

        try {
            return exchange(signatureProperties.getUrl() + "/api/downloadDocument?id={id}", HttpMethod.GET, null,
                    byte[].class, Collections.singletonMap("id", documentId)).getBody();
        } catch (Exception e) {
            LOGGER.error("Couldn't download document, document id = " + documentId, e);
            return new byte[0];
        }
    }

    private <E> ResponseEntity<E> exchange(String url, HttpMethod method, Object body, Class<E> clazz, Map<String, Object> args) {
        try {
            return restTemplate.exchange(
                    url,
                    method,
                    new HttpEntity<>(body, header(HttpHeaders.COOKIE, "JSESSIONID=" + getSignatureSessionId())),
                    clazz,
                    args);
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                setSignatureSessionId(login(signatureProperties.getUsername(), signatureProperties.getPassword()));

                return restTemplate.exchange(
                        url,
                        method,
                        new HttpEntity<>(body, header(HttpHeaders.COOKIE, "JSESSIONID=" + getSignatureSessionId())),
                        clazz,
                        args);
            } else {
                LOGGER.warn("Error occurred while exchanging with signature service:" + e.getResponseBodyAsString(), e);
                throw e;
            }
        }
    }

    private HttpHeaders header(String name, String value) {
        HttpHeaders result = new HttpHeaders();
        result.add(name, value);
        return result;
    }

    private String login(String username, String password) {
        Map<String, Object> o = new HashMap<>();
        o.put("username", username);
        o.put("password", password);

        ResponseEntity<Object> responseEntity = restTemplate.postForEntity(signatureProperties.getUrl() + "/loginProcess", o, Object.class);

        if (responseEntity.getStatusCode() == HttpStatus.OK) {
            return responseEntity.getHeaders()
                    .entrySet()
                    .stream()
                    .filter(e -> e.getKey().equals(HttpHeaders.SET_COOKIE))
                    .map(e -> e.getValue().get(0))
                    .flatMap(s -> Arrays.stream(s.split(";")))
                    .flatMap(s -> Arrays.stream(s.split(",")))
                    .filter(s -> s.contains("JSESSIONID"))
                    .findAny()
                    .map(s -> s.split("=")[1])
                    .orElse(null);
        }

        return null;
    }

    private String getSignatureSessionId() {
        synchronized (signatureSessionIdLock) {
            return signatureSessionId;
        }
    }

    private void setSignatureSessionId(String signatureSessionId) {
        synchronized (signatureSessionIdLock) {
            this.signatureSessionId = signatureSessionId;
        }
    }

    @EqualsAndHashCode
    private static class ByteArrayResourceImpl extends ByteArrayResource {
        private final String fileName;

        ByteArrayResourceImpl(byte[] byteArray, String fileName) {
            super(byteArray);
            this.fileName = fileName;
        }

        @Override
        public String getFilename() {
            return fileName;
        }
    }
}
