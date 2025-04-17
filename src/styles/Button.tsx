import styled, { css } from 'styled-components';
import { StyledComponentProps } from '@styles/StyledComponentProps.ts';

type SubProps = { theme: { darkGrey?: string, secondaryColor?: string } };

const Button = styled.button<StyledComponentProps>`
    padding: 0.4rem 1rem;
    background: ${(props) => props.theme.red};
    color: ${(props) => props.theme.white};
    border: 1px solid ${(props) => props.theme.red};
    border-radius: 3px;
    letter-spacing: 1.1px;

    ${(props: StyledComponentProps) => props.grey &&
            css`
                background: ${(props: SubProps) => props.theme.darkGrey};
                border: 1px solid ${(props: SubProps) => props.theme.darkGrey};
                color: ${(props: SubProps) => props.theme.secondaryColor};
            `}
`;

export default Button;
