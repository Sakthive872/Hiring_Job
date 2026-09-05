// File: src/features/jobs/components/EasyApplyModal.jsx
import { useState } from 'react';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function EasyApplyModal({ open, job, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ resume: null, coverNote: '' });
  const [state, setState] = useState({ status: 'idle', error: null });
  const update = (key) => (event) =>
    setForm({
      ...form,
      [key]: key === 'resume' ? event.target.files?.[0] : event.target.value,
    });
  const submit = async () => {
    setState({ status: 'loading', error: null });
    const payload = new FormData();
    payload.append('coverNote', form.coverNote);
    if (form.resume) payload.append('resume', form.resume);
    try {
      await axiosClient.post(endpoints.jobs.apply(job.id), payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setState({ status: 'succeeded', error: null });
      onComplete?.();
    } catch (error) {
      setState({
        status: 'failed',
        error:
          error.response?.data?.message || 'Application could not be submitted',
      });
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={job ? `Apply to ${job.title}` : 'Easy Apply'}
    >
      {state.status === 'succeeded' ? (
        <div className="state-panel">
          <strong>Application submitted</strong>
          <span>Your application was sent successfully.</span>
          <Button onClick={onClose}>Done</Button>
        </div>
      ) : (
        <div className="wizard">
          <span className="wizard-step">Step {step} of 2</span>
          {step === 1 ? (
            <>
              <h3>Share your resume</h3>
              <Input
                label="Resume or CV"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={update('resume')}
                required
              />
              <Button onClick={() => setStep(2)} disabled={!form.resume}>
                Continue
              </Button>
            </>
          ) : (
            <>
              <h3>Add a note</h3>
              <Input
                label="Cover note"
                value={form.coverNote}
                onChange={update('coverNote')}
                placeholder="Tell the team why this role interests you"
              />
              <div className="wizard-actions">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button loading={state.status === 'loading'} onClick={submit}>
                  Submit application
                </Button>
              </div>
              {state.error && (
                <span className="ui-field-error" role="alert">
                  {state.error}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
