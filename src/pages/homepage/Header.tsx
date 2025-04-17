import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router';
import SearchBar from './SearchBar.tsx';
import VideoUploadButton from './VideoUploadButton.tsx';
import Avatar from '@styles/Avatar';
import { HamburgerIcon, NotificationIcon } from '@components/Icons';
import { closeSidebar, openSidebar, SidebarState } from '@reducers/sidebar';
import type { RootDispatch, RootState } from '@redux-store.ts';
import { type UserState } from '@models/authUser';
import { ROUTES } from '@constants';
import defaultAvatar from '../../assets/default-avatar.svg';
import { StyledComponentProps } from '@styles/StyledComponentProps.ts';
import { Button } from '@mui/material';
import { logout } from '@reducers';

const Wrapper = styled.div<StyledComponentProps>`
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background: ${(props) => props.theme.grey};
    z-index: 99;
    padding: 0.7rem 1.5rem;

    input {
        width: 500px;
    }

    .toggle-navhandler {
        display: none;
    }

    .logo span {
        position: relative;
        top: 1px;
    }

    ul {
        list-style: none;
        display: flex;
        position: relative;
        top: 2px;
    }

    li svg {
        margin-right: 1.7rem;
        position: relative;
        top: 3px;
    }

    img {
        position: relative;
        top: 3px;
    }

    .dropdown-list {
        background: ${(props) => props.theme.darkGrey};
    }

    .dropdown-item {
        background: ${(props) => props.theme.red};
    }

    @media screen and (max-width: 1093px) {
        .toggle-navhandler {
            display: block;
        }
    }

    @media screen and (max-width: 1000px) {
        input {
            width: 400px;
        }
    }

    @media screen and (max-width: 850px) {
        input {
            width: 280px;
        }
    }

    @media screen and (max-width: 500px) {
        .toggle-navhandler {
            display: none;
        }

        li svg {
            width: 30px;
            height: 30px;
            margin-right: 1.7rem;
            position: relative;
            top: 0px;
        }
    }
`;

const Header = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { data: user } = useSelector<RootState, UserState>((state) => state.user);
  const { sidebar: open } = useSelector<RootState, SidebarState>((state) => state.sidebar);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownToggleRef = useRef<HTMLLIElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleSidebar = () => {
    if (open) {
      dispatch(closeSidebar());
    } else {
      dispatch(openSidebar());
    }
  };
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const handleClickLogout = () => dispatch(logout());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !dropdownToggleRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    // Attach listener on document
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Clean up listener on unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Wrapper>
      <div className="logo flex-row">
        <HamburgerIcon
          className="toggle-navhandler"
          onClick={handleToggleSidebar}
        />
        <span>
          <Link to="/">Microtube</Link>
        </span>
      </div>

      <SearchBar />

      {(user?.id >= 0) ? (
        <ul className="flex h-full items-end space-x-2 text-white border-0 hover:text-gray-300 focus:outline-none">
          <li>
            <VideoUploadButton />
          </li>
          <li>
            <NotificationIcon />
          </li>
          <li ref={dropdownToggleRef}>
            <Button
              variant="text"
              onClick={toggleDropdown}
            >
              {/*<img src={defaultAvatar} alt="Avatar" className="w-8 h-8 rounded-full" />*/}
              <Avatar className="w-8 h-8" src={user.avatar || defaultAvatar} alt="User's avatar" />
            </Button>
            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="h-full relative">
                <div
                  ref={dropdownRef}
                  className="dropdown-list absolute right-0 top-0 w-40 rounded-lg py-2 mt-2 shadow-lg text-gray-700 z-20">
                  <nav /* className="hidden md:flex space-x-6 text-teal-300"*/>
                    {/*<nav className="hidden md:flex space-x-6">*/}
                    {[
                      { name: 'Profile', route: '/profile' },
                      // { name: 'Logout', route: '/' },
                    ].map(({ name, route }, index) => {
                      return (
                        <Link
                          to={route}
                          key={index}
                          className="block px-4 py-2 transition duration-200 text-white no-underline"
                        >
                          {name}
                        </Link>
                      );
                    })}
                    {/*</nav>*/}
                    <div
                      onClick={handleClickLogout}
                      // className="block px-4 py-2 hover:bg-blue-gray-900 transition duration-200 text-white no-underline"
                      className="block w-full px-4 py-2 border-0 hover:cursor-pointer transition duration-200 font-bold text-white text-md"
                    >
                      Logout
                    </div>
                  </nav>
                </div>
              </div>
            )}
          </li>
        </ul>
      ) : (
        <Link to={ROUTES.AUTH_LOGIN}>Login</Link>
      )}
    </Wrapper>
  );
};

export default Header;
