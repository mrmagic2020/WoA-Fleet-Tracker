import React, { useEffect, useState } from "react";
import { getUsers } from "../services/AdminService";

const UserList: React.FC = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Registered Users</h2>
      <ul>
        {users.map((user: any) => (
          <li key={user._id}>{`[${user.role}] ${user.username}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
