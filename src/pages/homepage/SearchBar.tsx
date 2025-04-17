import React, { useRef } from 'react';
import { toast } from 'react-toastify';
// import { useHistory } from "react-router";
import styled from 'styled-components';
import useInput from '@hooks/useInput';
import { StyledComponentProps } from '@styles/StyledComponentProps.ts';
import { useNavigate, useSearchParams } from 'react-router';

const Wrapper = styled.div<StyledComponentProps>`
    input.search {
        background: ${(props) => props.theme.black};
        padding: 0.4rem 1rem;
        border: 1px solid ${(props) => props.theme.darkGrey};
        height: 31px;
        color: ${(props) => props.theme.primaryColor};
    }

    @media screen and (max-width: 700px) {
        input.search {
            display: none;
        }
    }
`;

const SearchBar = () => {
  const [searchParams, setSearchParams] = useSearchParams('');
  const inputRef = useRef<HTMLInputElement>();
  const searchString = useInput<string>(searchParams.get('q'));
  const navigate = useNavigate();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      if (!searchString.value.trim()) {
        return toast.dark('Please enter the searchterm');
      }

      inputRef.current?.blur();
      navigate(`/search?q=${searchString.value}`);
    }
  };

  return (
    <Wrapper>
      <input
        className="search"
        type="text"
        placeholder="Search"
        value={searchString.value}
        onKeyDown={handleSearch}
        onChange={searchString.onChange}
        ref={inputRef}
      />
    </Wrapper>
  );
};

export default SearchBar;
