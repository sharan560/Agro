package com.agroai.backend.controller;

import com.agroai.backend.service.DiseaseService;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping
public class DiseaseController {

    private final DiseaseService diseaseService;

    public DiseaseController(DiseaseService diseaseService) {
        this.diseaseService = diseaseService;
    }

    @PostMapping(path = "/predict", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> predict(@RequestPart("image") MultipartFile image) {
        return diseaseService.predict(image);
    }
}
