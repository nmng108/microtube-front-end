import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import useInput from '@hooks/useInput';
import { addComment, clearComments, clearCommentStatus, getComments } from '@reducers';
import { timeSince } from '@utils';
import { StyledComponentProps } from '@styles/StyledComponentProps';
import { RootDispatch, RootState } from '@redux-store.ts';
import defaultAvatar from '@assets/default-avatar.svg';
import { VideoState } from '@models/video.ts';
import { UserStateData } from '@models/authUser.ts';
import { CommentState, CommentStateStatus } from '@models/comment.ts';

const Wrapper = styled.div<StyledComponentProps>`
    margin: 1rem 0;

    h3 {
        margin-bottom: 0.8rem;
    }

    .add-comment {
        display: flex;
        align-items: center;
        margin-bottom: 2.3rem;
    }

    .add-comment textarea {
        background: inherit;
        border: none;
        border-bottom: 1px solid ${(props) => props.theme.darkGrey};
        color: ${(props) => props.theme.primaryColor};
        width: 100%;
        height: 100%;
    }

    .add-comment img {
        width: 40px;
        height: 40px;
        border-radius: 20px;
        object-fit: cover;
        margin-right: 1rem;
    }

    .comment {
        display: flex;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }

    .comment img {
        width: 40px;
        object-fit: cover;
        height: 40px;
        border-radius: 20px;
        position: relative;
        top: 2px;
        margin-right: 1rem;
    }
`;

const CommentSection = () => {
  const dispatch = useDispatch<RootDispatch>();
  const user = useSelector<RootState, UserStateData>((state) => state.user.data);
  const { problemMessage } = useSelector<RootState, VideoState>((state) => state.video);
  const { status, dataset, total } = useSelector<RootState, CommentState>((state) => state.video.comment);
  const commentInput = useInput('');
  const [commentLevel, setCommentLevel] = useState<number>();
  const [commentParentId, setCommentParentId] = useState<number>();
  const focusedCommentTextarea = useRef<HTMLTextAreaElement>();

  const handleAddComment = useCallback(async (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight + 10}px`;

    if (e.shiftKey && e.code === 'Enter') {
      e.preventDefault();

      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      textarea.value = value.substring(0, start) + '\n' + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      textarea.scrollTop = textarea.scrollHeight + 10;
    } else if (e.code === 'Enter') {
      e.preventDefault();
      // e.target.blur();
      if (focusedCommentTextarea.current === e.target) {
        focusedCommentTextarea.current.disabled = true;
      }

      if (!commentInput.value.trim()) {
        return toast.error('Please write a comment');
      }

      dispatch(addComment({
        content: commentInput.value,
        level: commentLevel,
        parentId: commentParentId,
      }));
    }
  }, [commentInput, commentLevel, dispatch, commentParentId]);

  const handleFocusCommentBox = useCallback((element: HTMLTextAreaElement, level: number, parentId?: number) => {
    focusedCommentTextarea.current = element;
    setCommentLevel(level);
    setCommentParentId(parentId);
  }, []);

  useEffect(() => {
    dispatch(getComments({}));

    return () => {
      dispatch(clearComments());
    };
  }, [dispatch]);

  useEffect(() => {
    if (status == CommentStateStatus.COMMENTING_SUCCEEDED) {
      if (focusedCommentTextarea.current) {
        focusedCommentTextarea.current.disabled = false;
      }

      commentInput.setValue('');
      dispatch(clearCommentStatus());
    } else if (status == CommentStateStatus.COMMENTING_FAILED) {
      if (focusedCommentTextarea.current) {
        focusedCommentTextarea.current.disabled = false;
      }

      toast.error(problemMessage);
      dispatch(clearCommentStatus());
    } else if (status === CommentStateStatus.DELETION_SUCCEEDED) {
      toast.success('Comment deleted!');
      dispatch(getComments({}));
      dispatch(clearCommentStatus());
    } else if (status === CommentStateStatus.DELETION_FAILED) {
      toast.error(problemMessage);
      dispatch(clearCommentStatus());
    }
  }, [commentInput, problemMessage, status, dispatch]);

  return (
    <Wrapper>
      <h3>{total} comments</h3>

      <div className="add-comment">
        <img src={user.avatar ?? defaultAvatar} alt="avatar" />
        <textarea
          placeholder="Add a public comment"
          value={commentInput.value}
          onKeyDown={handleAddComment}
          onChange={commentInput.onChange}
          onFocus={(e) => handleFocusCommentBox(e.target, 1, null)}
        />
      </div>

      {dataset && dataset.map((comment) => (
        <div key={comment.id} className="comment">
          <Link to={`/user/${comment.id}`}>
            <img src={comment.avatar || defaultAvatar} alt="avatar" />
          </Link>
          <div className="comment-info">
            <p className="secondary">
              <span>
                <Link to={`/user/${comment.userId}`}>
                  {comment.name}
                </Link>
              </span>
              <span style={{ marginLeft: '0.6rem' }}>
                {timeSince(new Date(comment.createdAt).getTime())} ago
              </span>
            </p>
            <p className="whitespace-pre-line">{comment.content}</p>
          </div>
        </div>
      ))}
    </Wrapper>
  );
};

export default CommentSection;
