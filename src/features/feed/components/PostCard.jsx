// File: src/features/feed/components/PostCard.jsx
import { MessageCircle, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import Avatar from '../../../components/ui/Avatar';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import { formatRelativeDate } from '../../../utils/dateUtils';

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(Boolean(post.liked));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [state, setState] = useState({ status: 'idle', error: null });
  const toggleLike = async () => {
    const previous = { liked, count: likeCount };
    setLiked(!liked);
    setLikeCount(likeCount + (liked ? -1 : 1));
    try {
      await axiosClient.post(endpoints.feed.like(post.id), { liked: !liked });
    } catch (error) {
      setLiked(previous.liked);
      setLikeCount(previous.count);
      setState({
        status: 'failed',
        error: error.response?.data?.message || 'Like could not be saved',
      });
    }
  };
  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    const text = comment.trim();
    const optimistic = {
      id: `pending-${Date.now()}`,
      content: text,
      pending: true,
    };
    setComments([...comments, optimistic]);
    setComment('');
    try {
      const { data } = await axiosClient.post(
        endpoints.feed.comments(post.id),
        { content: text },
      );
      setComments((items) =>
        items.map((item) => (item.id === optimistic.id ? data : item)),
      );
    } catch (error) {
      setComments((items) => items.filter((item) => item.id !== optimistic.id));
      setState({
        status: 'failed',
        error: error.response?.data?.message || 'Comment could not be saved',
      });
    }
  };
  return (
    <article className="post-card">
      <header className="post-author">
        <Avatar
          src={post.author?.avatarUrl}
          name={post.author?.name}
          size="medium"
        />
        <div>
          <strong>{post.author?.name || 'Member'}</strong>
          <span>{post.author?.headline || 'Professional member'}</span>
          <small>{formatRelativeDate(post.createdAt)}</small>
        </div>
      </header>
      <p className="post-content">{post.content}</p>
      <div className="post-actions">
        <button
          className={liked ? 'post-action active' : 'post-action'}
          onClick={toggleLike}
        >
          <ThumbsUp size={16} /> {likeCount}
        </button>
        <span className="post-action">
          <MessageCircle size={16} /> {comments.length}
        </span>
      </div>
      <div className="comment-list">
        {comments.map((item) => (
          <p key={item.id}>
            <strong>{item.author?.name || 'Member'}</strong> {item.content}
            {item.pending && <small> Sending...</small>}
          </p>
        ))}
      </div>
      <form className="comment-form" onSubmit={addComment}>
        <input
          aria-label="Add a comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Add a thoughtful comment"
        />
        <button type="submit" disabled={!comment.trim()}>
          Post
        </button>
      </form>
      {state.error && (
        <span className="ui-field-error" role="alert">
          {state.error}
        </span>
      )}
    </article>
  );
}
