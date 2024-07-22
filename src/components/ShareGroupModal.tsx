import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";

interface ShareGroupModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  username: string;
  groupName: string;
  groupID: string;
}

const ShareGroupModal: React.FC<ShareGroupModalProps> = ({
  show,
  setShow,
  username,
  groupName,
  groupID
}) => {
  const link = `${window.location.origin}/sharedGroups/${username}/${groupID}`;
  const [isShareLinkCopied, setIsShareLinkCopied] = useState(false);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(link);
    setIsShareLinkCopied(true);
    setTimeout(() => setIsShareLinkCopied(false), 3000);
  };

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Share Aircraft Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Share "{groupName}" with other people!
        <InputGroup className="mt-3 mb-3">
          <FormControl value={link} readOnly />
          <Button
            variant="outline-secondary"
            onClick={handleCopyShareLink}
            disabled={isShareLinkCopied}
          >
            {isShareLinkCopied ? "Copied!" : "Copy"}
          </Button>
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => setShow(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareGroupModal;
