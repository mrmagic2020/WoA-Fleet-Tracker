import React, { useEffect, useState } from "react";
import { getUsers } from "../services/AdminService";
import { useAuth } from "../contexts/AuthContext";
import Container from "react-bootstrap/Container";
import { UserRole } from "@mrmagic2020/shared/dist/enums";

const UserList: React.FC = () => {
  const role = useAuth().role;
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

  if (role !== UserRole.Admin) {
    return <Container fluid>You are not authorized to view this page</Container>;
  }
  return (
    <Container fluid>
      <h2>Registered Users</h2>
      <ul>
        {users.map((user: any) => (
          <li key={user._id}>{`[${user.role}] ${user.username}`}</li>
        ))}
      </ul>
    </Container>
  );
};

export default UserList;
