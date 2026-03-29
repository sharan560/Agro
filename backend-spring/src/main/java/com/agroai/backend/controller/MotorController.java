package com.agroai.backend.controller;

import com.agroai.backend.dto.MotorDtos;
import com.agroai.backend.service.MotorService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MotorController {

    private final MotorService motorService;

    public MotorController(MotorService motorService) {
        this.motorService = motorService;
    }

    @PostMapping("/motor/control")
    public Map<String, Object> control(
        @Valid @RequestBody MotorDtos.MotorControlRequest request,
        @RequestParam(name = "simulation", defaultValue = "false") boolean simulation
    ) {
        return motorService.control(request.action(), simulation);
    }

    @GetMapping("/motor/status")
    public Map<String, Object> status() {
        return motorService.status();
    }

    @GetMapping("/debug/thingspeak")
    public Map<String, Object> debugThingSpeak() {
        return motorService.debugThingSpeak();
    }
}
