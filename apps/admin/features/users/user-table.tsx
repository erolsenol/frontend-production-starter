"use client";

import type { UserStatus, UserSummary } from "@repo/contracts";

interface UserTableProps {
  readonly users: readonly UserSummary[];
  readonly onStatusChange: (user: UserSummary, status: UserStatus) => void;
  readonly onDelete: (user: UserSummary) => void;
}

export function UserTable({ users, onStatusChange, onDelete }: UserTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Last active</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <span className="table-user">
                  <span className="avatar small">{user.name.split(" ").map((part) => part[0]).join("")}</span>
                  <span><strong>{user.name}</strong><small>{user.email}</small></span>
                </span>
              </td>
              <td>{user.role}</td>
              <td>
                <select
                  className="user-status-select"
                  aria-label={`Update status for ${user.name}`}
                  value={user.status}
                  onChange={(event) => onStatusChange(user, event.currentTarget.value as UserStatus)}
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="suspended">Suspended</option>
                </select>
              </td>
              <td>{user.lastActive}</td>
              <td>
                <button className="more-button" type="button" aria-label={`Delete ${user.name}`} onClick={() => onDelete(user)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
