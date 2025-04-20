import React from "react";
import { NavLink } from "react-router";
import styled from "styled-components";
import {
  HomeIcon,
  TrendingIcon,
  SubIcon,
  HistoryIcon,
  WatchIcon,
} from "./Icons";
import { StyledComponentProps } from '@styles/StyledComponentProps.ts';

const Wrapper = styled.div<StyledComponentProps>`
  position: fixed;
  z-index: 100;
  bottom: 0;
  left: 0;
  width: 100%;
  background: ${(props) => props.theme.grey};
  border-top: 1px solid ${(props) => props.theme.darkGrey};
  display: none;
  padding: 0.8rem 1rem;

  .icons a {
    padding: 0;
    margin: 0;
  }

  .icons {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .icons svg {
    width: 30px;
    height: 30px;
    fill: ${(props) => props.theme.darkGrey};
  }

  .icons img {
    width: 26px;
    height: 26px;
    object-fit: cover;
    border-radius: 13px;
  }

  .active svg {
    fill: ${(props) => props.theme.primaryColor};
  }

  @media screen and (max-width: 500px) {
    display: block;
  }
`;

const BottomBar = () => {
  return (
    <Wrapper>
      <div className="icons">
        <NavLink className="active" to="/">
          <HomeIcon />
        </NavLink>

        <NavLink className="active" to="/trending">
          <TrendingIcon />
        </NavLink>

        <NavLink className="active" to="/subscriptions">
          <SubIcon />
        </NavLink>

        <NavLink className="active" to="/history">
          <HistoryIcon />
        </NavLink>

        <NavLink className="active" to="/liked_videos">
          <WatchIcon />
        </NavLink>
      </div>
    </Wrapper>
  );
};

export default BottomBar;
