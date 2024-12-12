import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private apiUrl = '/api/ai-assistant/query'; // Ensure this is correct

  constructor(private http: HttpClient) {}

  // Make sure to use POST if your FastAPI endpoint expects it
  getBotResponse(userInput: string): Observable<{ human_response: string }> {
    const encodedQuery = encodeURIComponent(userInput); // Encode the user input
    return this.http.get<{ human_response: string }>(`${this.apiUrl}?query=${encodedQuery}`);
}
}
