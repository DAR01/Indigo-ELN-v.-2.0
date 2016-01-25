package com.epam.indigoeln.core.service.bingodb;

import java.util.Base64;

import javax.validation.ValidationException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.epam.indigoeln.core.integration.BingoResult;

/**
 * Service for execution BingoDB operations
 */
@Service
public class BingoDbIntegrationService {

    private static final String BINGO_URL_MOLECULE = "%s/molecule";
    private static final String BINGO_URL_GET_OR_UPDATE_MOLECULE = BINGO_URL_MOLECULE + "/%s";


    @Value("${integration.bingodb.url}")
    private String bingoUrl;

    @Value("${integration.bingodb.username}")
    private String bingoUsername;

    @Value("${integration.bingodb.password}")
    private String bingoPassword;

    public String getMolecule(Integer id) {
        return execute(String.format(BINGO_URL_GET_OR_UPDATE_MOLECULE, bingoUrl, id), HttpMethod.GET, null).getStructure();
    }

    public Integer addMolecule(String molfile) {
        return execute(String.format(BINGO_URL_MOLECULE, bingoUrl), HttpMethod.POST, molfile).getId();
    }

    public Integer updateMolecule(Integer id, String molfile) {
        execute(String.format(BINGO_URL_GET_OR_UPDATE_MOLECULE, bingoUrl, id), HttpMethod.PUT, molfile);
        return id;
    }

    public void deleteMolecule(Integer id) {
        execute(String.format(BINGO_URL_GET_OR_UPDATE_MOLECULE, bingoUrl, id), HttpMethod.DELETE, null);
    }

    private BingoResult handleErrorResponse(ResponseEntity<BingoResult> response) {
        if(!response.getStatusCode().is2xxSuccessful()) {
            throw new HttpClientErrorException(response.getStatusCode());
        }

        if (!response.getBody().isSuccess()) {
            throw new ValidationException("BingoDB request failed with error: " + response.getBody().getErrorMessage());
        }

        return response.getBody();
    }

    private BingoResult execute(String url, HttpMethod method, String content) {
        RestTemplate template = new RestTemplate();
        return  handleErrorResponse(template.exchange(url, method, basicAuthorization(content), BingoResult.class));
    }

    @SuppressWarnings("unchecked")
    private HttpEntity basicAuthorization(String requestBody) {
        HttpHeaders headers = new HttpHeaders();
        String base64Credentials = new String(Base64.getEncoder().encode(String.format("%s:%s", bingoUsername, bingoPassword).getBytes()));
        headers.add(HttpHeaders.AUTHORIZATION, "Basic " + base64Credentials);
        return new HttpEntity(requestBody, headers);
    }
}
