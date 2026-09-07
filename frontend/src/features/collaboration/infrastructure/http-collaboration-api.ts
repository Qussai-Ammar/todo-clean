import { HttpClient } from "../../../shared/http-client.js";
import { CollaboratorRole, Member } from "../domain/member.js";
import { CollaborationApi } from "../application/ports/collaboration-api.js";

export class HttpCollaborationApi implements CollaborationApi {
  constructor(private readonly http: HttpClient) {}

  list(projectId: string): Promise<Member[]> {
    return this.http.get<Member[]>(`/projects/${projectId}/members`);
  }

  invite(projectId: string, email: string, role: CollaboratorRole): Promise<Member> {
    return this.http.post<Member>(`/projects/${projectId}/members`, { email, role });
  }

  changeRole(projectId: string, userId: string, role: CollaboratorRole): Promise<Member> {
    return this.http.patch<Member>(`/projects/${projectId}/members/${userId}`, { role });
  }

  remove(projectId: string, userId: string): Promise<void> {
    return this.http.delete<void>(`/projects/${projectId}/members/${userId}`);
  }
}
