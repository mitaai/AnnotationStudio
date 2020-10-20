import React, { useState } from 'react';
import Router from 'next/router';
import { useSession } from 'next-auth/client';
import {
  Badge, Button, Card, Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import AdminHeader from '../../../components/Admin/AdminHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Layout from '../../../components/Layout';
import { prefetchUserById } from '../../../utils/userUtil';
import AdminRoleBadge from '../../../components/Admin/AdminRoleBadge';

const AdminManageUser = (props) => {
  const { user, initAlert } = props;
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlert || []);
  return (
    <Layout type="admin" alerts={alerts}>
      {loading && (
        <Card>
          <Card.Body>
            <LoadingSpinner />
          </Card.Body>
        </Card>
      )}
      {!loading && (!session || session.user.role !== 'admin') && (
        <Card>
          <Card.Body>
            Sorry, you do not have persmission to view this page.
          </Card.Body>
        </Card>
      )}
      {!loading && session && session.user.role === 'admin' && (
        <Card>
          <AdminHeader
            activeKey="users"
            setKey={
              (k) => Router.push(`/admin?tab=${k}`).catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }]))
            }
          />
          <Card.Body>
            {user && (
              <Table
                striped
                bordered
                hover
                size="sm"
                variant="light"
                style={{ borderCollapse: 'unset' }}
              >
                <thead>
                  <tr>
                    <td colSpan="2" className="text-center">Manage User</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th style={{ width: '25%' }}>First Name</th>
                    <td>{user.firstName}</td>
                  </tr>
                  <tr>
                    <th>Last Name</th>
                    <td>{user.lastName}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <th>Slug</th>
                    <td>{user.slug}</td>
                  </tr>
                  <tr>
                    <th>Affiliation</th>
                    <td>{user.affiliation}</td>
                  </tr>
                  <tr>
                    <th>Role</th>
                    <td><AdminRoleBadge role={user.role} /></td>
                  </tr>
                  <tr>
                    <th>Registered</th>
                    <td>{format(new Date(user.createdAt), 'PPPppp')}</td>
                  </tr>
                  <tr>
                    <th>Updated</th>
                    <td>{format(new Date(user.updatedAt), 'PPPppp')}</td>
                  </tr>
                  <tr>
                    <th>Last login</th>
                    <td>{user.emailVerified && format(new Date(user.emailVerified), 'PPPppp')}</td>
                  </tr>
                  <tr>
                    <th>Groups</th>
                    <td>
                      {(user.groups && user.groups.length > 0)
                        ? user.groups.sort().map((group) => {
                          let variant;
                          switch (group.role) {
                            case 'member':
                              variant = 'secondary';
                              break;
                            case 'manager':
                              variant = 'warning';
                              break;
                            case 'owner':
                              variant = 'primary';
                              break;
                            default:
                              variant = 'secondary';
                              break;
                          }
                          return (
                            <Badge
                              variant={variant}
                              className="mr-1"
                              as={Button}
                              href={`/admin/group/${group.id}`}
                              key={group.id}
                            >
                              {group.name}
                            </Badge>
                          );
                        })
                        : (<Badge>[no groups]</Badge>)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;
  let props = {};
  await prefetchUserById(id, context.req.headers.cookie)
    .then((user) => {
      props = { user };
    })
    .catch((err) => {
      props = { initAlert: [{ text: err.message, variant: 'danger' }] };
    });
  return { props };
}

export default AdminManageUser;
