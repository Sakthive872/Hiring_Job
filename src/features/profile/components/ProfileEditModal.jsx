// File: src/features/profile/components/ProfileEditModal.jsx
import { useState } from 'react';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import {
  getCurrentUser,
  setCurrentUser,
} from '../../../services/storage/localStorage';

function fieldsFor(section, value) {
  if (section === 'experience')
    return {
      title: value?.title || '',
      companyName: value?.company?.name || value?.companyName || '',
      startDate: value?.startDate || '',
      endDate: value?.endDate || '',
      description: value?.description || '',
    };
  if (section === 'about') return { about: value?.about || '' };
  if (section === 'openTo') return { openTo: value?.openTo || '' };
  return {
    name: value?.name || '',
    headline: value?.headline || '',
    location: value?.location || '',
    companyName: value?.company?.name || value?.companyName || '',
    educationName: value?.education?.name || value?.educationName || '',
  };
}
export default function ProfileEditModal({
  open,
  onClose,
  section = 'profile',
  profile,
  value,
  userId,
  onSaved,
}) {
  const [form, setForm] = useState(() => fieldsFor(section, value || profile));
  const [state, setState] = useState({ status: 'idle', error: null });
  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setState({ status: 'loading', error: null });
    const base = endpoints.users.byId(userId);
    const path =
      section === 'experience'
        ? `${base}/experience${value?.id ? `/${encodeURIComponent(value.id)}` : ''}`
        : base;
    const payload =
      section === 'experience'
        ? form
        : section === 'about'
          ? { about: form.about }
          : section === 'openTo'
            ? { openTo: form.openTo }
            : form;
    if (!userId) {
      onSaved?.(
        section === 'experience'
          ? { ...form, id: value?.id || `local-${Date.now()}` }
          : form,
        section,
        form,
      );
      onClose?.();
      return;
    }
    try {
      if (!userId) {
        const currentUser = getCurrentUser();
        const nextUser = {
          ...currentUser,
          ...(section === 'about' ? { about: form.about } : {}),
          ...(section === 'openTo' ? { openTo: form.openTo } : {}),
          ...(section === 'experience'
            ? {
                experience: [
                  ...(currentUser?.experience || []),
                  { ...form, id: value?.id || `local-${Date.now()}` },
                ],
              }
            : {}),
          ...(section !== 'experience' &&
          section !== 'about' &&
          section !== 'openTo'
            ? {
                name: form.name || currentUser?.name || '',
                headline: form.headline || '',
                location: form.location || '',
                companyName: form.companyName || '',
                educationName: form.educationName || '',
              }
            : {}),
        };
        setCurrentUser(nextUser);
        onSaved?.(nextUser, section, form);
        onClose?.();
        return;
      }
      const { data } = await axiosClient.patch(path, payload);
      onSaved?.(data, section, form);
      onClose?.();
    } catch (error) {
      setState({
        status: 'failed',
        error: error.response?.data?.message || 'Changes could not be saved',
      });
    }
  };
  const title =
    section === 'experience'
      ? 'Edit experience'
      : section === 'about'
        ? 'Edit About'
        : section === 'openTo'
          ? 'Edit open to work'
          : 'Edit profile';
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form className="profile-edit-form" onSubmit={submit}>
        {section === 'experience' ? (
          <>
            <Input
              label="Role title"
              value={form.title}
              onChange={update('title')}
              required
            />
            <Input
              label="Company"
              value={form.companyName}
              onChange={update('companyName')}
              required
            />
            <Input
              label="Start date"
              type="month"
              value={form.startDate}
              onChange={update('startDate')}
            />
            <Input
              label="End date"
              type="month"
              value={form.endDate}
              onChange={update('endDate')}
            />
            <Input
              label="Description"
              value={form.description}
              onChange={update('description')}
            />
          </>
        ) : section === 'about' ? (
          <Input label="About" value={form.about} onChange={update('about')} />
        ) : section === 'openTo' ? (
          <Input
            label="Open to work details"
            value={form.openTo}
            onChange={update('openTo')}
          />
        ) : (
          <>
            <Input
              label="Name"
              value={form.name}
              onChange={update('name')}
              required
            />
            <Input
              label="Headline"
              value={form.headline}
              onChange={update('headline')}
            />
            <Input
              label="Location"
              value={form.location}
              onChange={update('location')}
            />
            <Input
              label="Company"
              value={form.companyName}
              onChange={update('companyName')}
            />
            <Input
              label="Education"
              value={form.educationName}
              onChange={update('educationName')}
            />
          </>
        )}
        {state.error && (
          <span className="ui-field-error" role="alert">
            {state.error}
          </span>
        )}
        <Button type="submit" loading={state.status === 'loading'}>
          Save changes
        </Button>
      </form>
    </Modal>
  );
}
