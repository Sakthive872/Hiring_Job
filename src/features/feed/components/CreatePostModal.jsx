// File: src/features/feed/components/CreatePostModal.jsx
import { useState } from 'react';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

export default function CreatePostModal({ open, onClose, onCreated }) {
  const [content, setContent] = useState('');
  const [state, setState] = useState({ status: 'idle', error: null });
  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    setState({ status: 'loading', error: null });
    try {
      const { data } = await axiosClient.post(endpoints.feed.posts, {
        content: content.trim(),
      });
      onCreated?.(data);
      setContent('');
      setState({ status: 'idle', error: null });
      onClose?.();
    } catch (error) {
      setState({
        status: 'failed',
        error: error.response?.data?.message || 'Post could not be published',
      });
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Create a professional update">
      <form className="post-form" onSubmit={submit}>
        <label htmlFor="post-content">What would you like to share?</label>
        <textarea
          id="post-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Share an idea, milestone, or opportunity"
          rows={6}
          maxLength={5000}
          required
        />
        {state.error && (
          <span className="ui-field-error" role="alert">
            {state.error}
          </span>
        )}
        <Button
          type="submit"
          loading={state.status === 'loading'}
          disabled={!content.trim()}
        >
          Publish update
        </Button>
      </form>
    </Modal>
  );
}
