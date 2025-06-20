package com.company.enroller.controllers;

import com.company.enroller.model.Participant;
import com.company.enroller.persistence.ParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = {
		"http://localhost:3000",
		"https://enroller-fullstack-30eq.onrender.com"
})
@RestController
@RequestMapping("/api/participants")
public class ParticipantRestController {

	@Autowired
	ParticipantService participantService;

	@GetMapping(value = "")
	public ResponseEntity<?> getParticipants(@RequestParam(value = "sortBy", defaultValue = "") String sortMode,
											 @RequestParam(value = "sortOrder", defaultValue = "") String sortOrder,
											 @RequestParam(value = "key", defaultValue = "") String login) {
		Collection<Participant> participants = participantService.getAll(login, sortMode, sortOrder);
		return new ResponseEntity<Collection<Participant>>(participants, HttpStatus.OK);
	}

	@RequestMapping(value = "/{id}", method = RequestMethod.GET)
	public ResponseEntity<?> getParticipant(@PathVariable("id") String login) {
		Participant participant = participantService.findByLogin(login);
		if (participant == null) {
			return new ResponseEntity(HttpStatus.NOT_FOUND);
		}
		return new ResponseEntity<Participant>(participant, HttpStatus.OK);
	}

	@RequestMapping(value = "", method = RequestMethod.POST)
	public ResponseEntity<?> addParticipant(@RequestBody Participant participant) {
		if (participantService.findByLogin(participant.getLogin()) != null) {
			return new ResponseEntity<String>(
					"Unable to create. A participant with login " + participant.getLogin() + " already exist.",
					HttpStatus.CONFLICT);
		}
		participantService.add(participant);
		return new ResponseEntity<Participant>(participant, HttpStatus.CREATED);
	}

	@RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
	public ResponseEntity<?> delete(@PathVariable("id") String login) {
		Participant participant = participantService.findByLogin(login);
		if (participant == null) {
			return new ResponseEntity(HttpStatus.NOT_FOUND);
		}
		participantService.delete(participant);
		return new ResponseEntity<Participant>(HttpStatus.OK);
	}

	@RequestMapping(value = "/{id}", method = RequestMethod.PUT)
	public ResponseEntity<?> update(@PathVariable("id") String login, @RequestBody Participant updatedParticipant) {
		Participant participant = participantService.findByLogin(login);
		if (participant == null) {
			return new ResponseEntity(HttpStatus.NOT_FOUND);
		}
		participantService.update(participant);
		return new ResponseEntity<Participant>(HttpStatus.OK);
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody Participant participant) {
		if (participantService.findByLogin(participant.getLogin()) != null) {
			return new ResponseEntity<String>(
					"Użytkownik o podanym adresie email już istnieje",
					HttpStatus.CONFLICT);
		}
		participantService.add(participant);
		return new ResponseEntity<>(HttpStatus.CREATED);
	}

	@PostMapping("/auth")
	public ResponseEntity<?> authenticate(@RequestBody Participant participant) {
		Participant existingParticipant = participantService.findByLogin(participant.getLogin());

		if (existingParticipant == null ||
				!existingParticipant.getPassword().equals(participant.getPassword())) {
			return new ResponseEntity<String>(
					"Nieprawidłowy email lub hasło",
					HttpStatus.UNAUTHORIZED);
		}

		Map<String, String> response = new HashMap<>();
		response.put("token", generateToken(existingParticipant));
		response.put("login", existingParticipant.getLogin());

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	private String generateToken(Participant participant) {
		String timeStamp = String.valueOf(System.currentTimeMillis());
		return Base64.getEncoder().encodeToString(
				(participant.getLogin() + ":" + timeStamp).getBytes()
		);
	}
}