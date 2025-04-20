import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import UpdateChannelModal from './UpdateChannelModal.tsx';
import Button from '@styles/Button';
import type { StyledComponentProps } from '@styles/StyledComponentProps.ts';

const Wrapper = styled.div<StyledComponentProps>`
    svg {
        width: 30px;
        height: 30px;
        margin-left: 1rem;
        fill: ${(props) => props.theme.darkGrey};
    }

    div {
        display: flex;
        align-items: center;
    }

    @media screen and (max-width: 440px) {
        margin-top: 1rem;
    }
`;

// TODO: elements should be placed outside thus remove this component
const EditChannelButton = () => {
  const [showModal, setShowModal] = useState(false);

  const closeModal = useCallback(() => setShowModal(false), []);

  return (
    <>
      <Wrapper>
        <div>
          <Button onClick={() => setShowModal(true)}>
            Edit Profile
          </Button>
        </div>
      </Wrapper>
      {showModal && <UpdateChannelModal closeModal={closeModal} />}
    </>
  );
};

export default EditChannelButton;
