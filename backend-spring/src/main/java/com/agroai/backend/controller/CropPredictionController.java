package com.agroai.backend.controller;

import com.agroai.backend.service.CropPredictionService;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class CropPredictionController {

    private final CropPredictionService cropPredictionService;

    public CropPredictionController(CropPredictionService cropPredictionService) {
        this.cropPredictionService = cropPredictionService;
    }

    @PostMapping(path = "/predict", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> predict(@RequestBody Map<String, Object> request) {
        return cropPredictionService.predict(request);
    }
}
