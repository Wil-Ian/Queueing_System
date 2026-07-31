package com.example.demo.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/tts")
public class TtsController {

    @Value("${kokoro.base-url}")
    private String kokoroBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/speak")
    public ResponseEntity<?> speak(@RequestBody Map<String, Object> requestBody) {
        String url = kokoroBaseUrl + "/v1/audio/speech";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            byte[] audioBytes = restTemplate.postForObject(url, new org.springframework.http.HttpEntity<>(requestBody, headers), byte[].class);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("audio/mpeg"))
                    .body(audioBytes);

        } catch (ResourceAccessException e) {
            // Kokoro is unreachable entirely (not running, wrong host/port, network issue)
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "TTS service is unreachable."));

        } catch (HttpStatusCodeException e) {
            // Kokoro responded, but with an error status (bad request, internal error, etc.)
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "TTS service returned an error: " + e.getStatusCode()));
        }
    }
}