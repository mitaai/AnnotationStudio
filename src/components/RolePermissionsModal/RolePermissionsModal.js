/* eslint-disable max-len */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Modal } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import styles from './RolePermissionsModal.module.scss';

const SelectInput = ({
  show,
  setShow,
}) => {
  const spacer = (
    <div
      style={{
        width: 100, height: 6, borderRadius: 3, backgroundColor: '#fafafa', margin: '0px auto', color: 'transparent',
      }}
    >
      .
    </div>
  );

  return (
    <Modal
      id="group-role-permissions-modal"
      size="lg"
      show={show}
      onHide={() => setShow()}
    >
      <Modal.Body style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{
            flex: 1, fontSize: 22, fontWeight: 'bold', color: '#363D4E', marginLeft: 5,
          }}
          >
            Group Role Permissions Explained
          </div>
          <div className={styles.closeModalBtn} onClick={() => setShow()}>
            <X size={20} />
          </div>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', marginTop: 30, marginBottom: 70, padding: '0px 20px 0px 15px',
        }}
        >
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#363D4E' }}>Members</div>
          <div style={{ marginBottom: 25, color: '#898C95' }}>
            Group Members can see documents and annotations shared with the group, and can annotate those documents. They can also see who else is in the group.
          </div>
          {spacer}
          <div style={{
            marginTop: 10, fontSize: 18, fontWeight: 'bold', color: '#363D4E',
          }}
          >
            Managers
          </div>
          <div style={{ marginBottom: 25, color: '#898C95' }}>
            Group Managers are Members who can also invite users to the group, remove users from the group, and change users&apos; roles between Manager and Member.
          </div>
          {spacer}
          <div style={{
            marginTop: 10, fontSize: 18, fontWeight: 'bold', color: '#363D4E',
          }}
          >
            Owners
          </div>
          <div style={{ color: '#898C95' }}>
            Group Owners are Managers who can also delete the group.
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SelectInput;


