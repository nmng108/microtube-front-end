import React, { useState } from "react";
import { redirect } from 'react-router';
import { useDispatch } from "react-redux";
import styled from "styled-components";
import EditChannelModal from "./EditChannelModal.tsx";
import Button from "@styles/Button";
import { SignoutIcon } from "@components/Icons";
import { logout } from "@reducers/user";
import type { StyledComponentProps } from '@styles/StyledComponentProps.ts';
import { ROUTES } from '@constants';
import { RootDispatch } from '@redux-store.ts';

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

const EditChannelButton = () => {
  const dispatch = useDispatch<RootDispatch>();
  const [showModal, setShowModal] = useState(false);

  const closeModal = () => setShowModal(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("user");
    redirect(ROUTES.AUTH_LOGIN);
  };

  return (
    <>
      <Wrapper>
        <div>
          <Button onClick={() => setShowModal(true)}>
            Edit Profile
          </Button>
          {/*<SignoutIcon onClick={handleLogout} />*/}
        </div>
      </Wrapper>
      {showModal && <EditChannelModal closeModal={closeModal} />}
    </>
  );
};

export default EditChannelButton;
