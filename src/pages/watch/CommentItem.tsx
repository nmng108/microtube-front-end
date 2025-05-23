import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import useInput from '@hooks/useInput';
import { addComment, deleteComment, getComments } from '@reducers';
import { timeSince } from '@utils';
import { StyledComponentProps } from '@styles/StyledComponentProps';
import { RootDispatch, RootState } from '@redux-store.ts';
import defaultAvatar from '@assets/default-avatar.svg';
import { UserStateData } from '@models/authUser.ts';
import { CommentState, CommentStateData, CommentStateStatus } from '@models/comment';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import { VideoState } from '@models/video.ts';

type Wrapper = StyledComponentProps & { commentLevel: number };

const Wrapper = styled.div<Wrapper>`
  margin: 1rem 0;

  h3 {
    margin-bottom: 0.8rem;
  }

  .add-comment {
    display: flex;
    align-items: flex-start; /* Align items to the top for textarea */
    margin-bottom: 2.3rem;
  }

  .add-comment textarea {
    background: inherit;
    border: none;
    border-bottom: 1px solid ${(props) => props.theme.darkGrey};
    color: ${(props) => props.theme.primaryColor};
    width: 100%;
    height: auto; /* Adjust height automatically */
    min-height: 40px; /* Minimum height to match avatar */
    padding: 0.5rem 0;
    font-size: 1rem;
    resize: vertical; /* Allow vertical resizing */
  }

  .add-comment img {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    object-fit: cover;
    margin-right: 1rem;
  }

  .comment-item {
    margin-bottom: 1rem;
    padding-left: ${(props) =>
      props.commentLevel && props.commentLevel > 1 ? `${(props.commentLevel - 1) * 2}rem` : '0'};
  }

  .comment {
    display: flex;
    font-size: 0.9rem;
    align-items: flex-start; /* Align items to the top */
  }

  .comment img {
    width: 40px;
    object-fit: cover;
    height: 40px;
    border-radius: 20px;
    margin-right: 1rem;
  }

  .comment-info {
    flex-grow: 1;
  }

  .comment-actions {
    display: flex;
    align-items: center;
    margin-top: 0.3rem;
    font-size: 0.8rem;
    color: ${(props) => props.theme.secondaryColor};

    button {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      margin-right: 0.8rem;
      padding: 0;
      display: flex;
      align-items: center;

      svg {
        margin-right: 0.3rem;
      }

      &:hover {
        color: ${(props) => props.theme.primaryColor};
      }
    }
  }

  .reply-form {
    display: flex;
    align-items: flex-start;
    margin-top: 1rem;
  }

  .reply-form textarea {
    background: inherit;
    border: none;
    border-bottom: 1px solid ${(props) => props.theme.darkGrey};
    color: ${(props) => props.theme.primaryColor};
    width: 100%;
    height: auto;
    min-height: 30px;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    resize: vertical;
  }

  .reply-form img {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    object-fit: cover;
    margin-right: 1rem;
  }
`;

interface CommentItemProps {
  comment: CommentStateData;
  onReply?: (element: HTMLTextAreaElement, parentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply }) => {
  const dispatch = useDispatch<RootDispatch>();
  const user = useSelector<RootState, UserStateData>((state) => state.user.data);
  const { problemMessage } = useSelector<RootState, VideoState>((state) => state.video);
  const { status } = useSelector<RootState, CommentState>((state) => state.video.comment);
  const [isReplying, setIsReplying] = useState(false);
  const [showsReplies, setShowsReplies] = useState(comment?.children?.total == 0);
  const replyInput = useInput('');
  const focusedReplyTextarea = useRef<HTMLTextAreaElement>(null);

  const handleReplyClick = useCallback(() => {
    setIsReplying(true);
    // Focus on the reply textarea if it exists after the next render
    setTimeout(() => {
      if (focusedReplyTextarea.current) {
        focusedReplyTextarea.current.focus();
        // onReply(focusedReplyTextarea.current, comment.id);
      }
    }, 0);
  }, []);

  const handleReplySubmit = useCallback(
    async (
      e: React.KeyboardEvent<HTMLTextAreaElement> & {
        target: HTMLTextAreaElement;
      }
    ) => {
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

        if (!replyInput.value.trim()) {
          return toast.error('Please write a reply');
        }

        if (focusedReplyTextarea.current === e.currentTarget) {
          focusedReplyTextarea.current.disabled = true;
        }

        dispatch(
          addComment({
            content: replyInput.value,
            level: comment.level + 1,
            parentId: comment.id,
          })
        );
        setIsReplying(false);
      }
    },
    [comment.id, comment.level, dispatch, replyInput]
  );

  const handleDeleteClick = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment({ id: comment.id, parentId: comment.parentId, level: comment.level }));
    }
  }, [comment.id, comment.level, comment.parentId, dispatch]);

  const handleShowHideReplies = useCallback(() => {
    setShowsReplies((prev) => !prev);
  }, []);

  const handleLoadMoreReplies = useCallback(() => {
    setShowsReplies(true);
    dispatch(getComments({ parentId: comment.id, parentLevel: comment.level }));
  }, [comment.id, comment.level, dispatch]);

  useEffect(() => {
    if (status == CommentStateStatus.COMMENTING_SUCCEEDED) {
      if (focusedReplyTextarea.current) {
        focusedReplyTextarea.current.disabled = false;
      }

      replyInput.setValue('');
    } else if (status == CommentStateStatus.COMMENTING_FAILED) {
      if (focusedReplyTextarea.current) {
        focusedReplyTextarea.current.disabled = false;
      }
    }
  }, [replyInput, problemMessage, status, dispatch]);

  return (
    <Wrapper className="comment-item" commentLevel={comment.level}>
      <div className="comment">
        <Link to={`/user/${comment.userId}`}>
          <img src={comment.avatar || defaultAvatar} alt="avatar" />
        </Link>
        <div className="comment-info">
          <p className="secondary">
            <span>
              <Link to={`/user/${comment.userId}`}>{comment.name}</Link>
            </span>
            <span style={{ marginLeft: '0.6rem' }}>{timeSince(new Date(comment.createdAt).getTime())} ago</span>
          </p>
          <p className="whitespace-pre-line">{comment.content}</p>
          <div className="comment-actions">
            <button type="button" onClick={handleReplyClick} style={{ fontSize: 'inherit' }}>
              <ReplyIcon style={{ fontSize: '1rem' }} /> <span>Reply</span>
            </button>
            {comment.isOwned && (
              <IconButton onClick={handleDeleteClick} size="small" aria-label="delete">
                <DeleteIcon style={{ fontSize: '1rem' }} />
              </IconButton>
            )}
            {comment.childCount > 0 && (
              <span>
                {comment.childCount} {comment.childCount > 1 ? 'replies' : 'reply'}
              </span>
            )}
          </div>
          {isReplying && (
            <div className="reply-form">
              <img src={user?.avatar || defaultAvatar} alt="avatar" />
              <textarea
                ref={focusedReplyTextarea}
                placeholder="Reply to this comment"
                value={replyInput.value}
                onKeyDown={handleReplySubmit}
                onChange={replyInput.onChange}
                onFocus={(e) => onReply(e.target, comment.id)}
              />
            </div>
          )}
          {comment.level < 3 && (
            <>
              {comment.children?.total > 0 && (!showsReplies || comment.children.dataset.length == 0) && (
                <a
                  onClick={comment.children.dataset.length == 0 ? handleLoadMoreReplies : handleShowHideReplies}
                  className="underline text-blue-600 cursor-pointer"
                >
                  See replies
                </a>
              )}
              {showsReplies && comment.children.dataset.length > 0 && (
                <a onClick={handleShowHideReplies} className="underline text-blue-600 cursor-pointer">
                  Hide replies
                </a>
              )}
              {showsReplies && (
                <>
                  {comment.children?.total > 0 &&
                    comment.children.dataset.map((childComment) => (
                      <CommentItem key={childComment.id} comment={childComment} onReply={onReply} />
                    ))}
                  {
                    /*comment.level < 2 /*Limit maximum level to 2 &&*/ comment.children?.total > 0 &&
                      comment.children.dataset.length > 0 &&
                      comment.children.dataset.length < comment.children.total && (
                        <a onClick={handleLoadMoreReplies} className="underline text-blue-600 cursor-pointer">
                          Load more replies...
                        </a>
                      )
                  }
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default CommentItem;
