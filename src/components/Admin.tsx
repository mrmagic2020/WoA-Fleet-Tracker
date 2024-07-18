import React, { useEffect, useState } from "react";
import { getUsers } from "../services/AdminService";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "@mrmagic2020/shared/dist/enums";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";

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
    return (
      <Container fluid>You are not authorized to view this page</Container>
    );
  }
  return (
    <Container fluid>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Admin</Breadcrumb.Item>
      </Breadcrumb>
      <h2>Registered Users</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <Button variant="outline-danger" size="sm">
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default UserList;
