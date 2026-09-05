// File: src/features/recruiter/components/PostJobWizard.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { postJob } from '../api/recruiterApi';

const emptyForm = {
  title: '',
  location: '',
  workplaceType: '',
  employmentType: '',
  description: '',
  salaryMin: '',
  salaryMax: '',
};
export default function PostJobWizard({ open, onClose, onComplete }) {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [state, setState] = useState({ status: 'idle', error: null });
  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  const submit = async () => {
    setState({ status: 'loading', error: null });
    const result = await dispatch(
      postJob({
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      }),
    );
    if (postJob.fulfilled.match(result)) {
      setState({ status: 'succeeded', error: null });
      onComplete?.(result.payload);
    } else setState({ status: 'failed', error: result.payload });
  };
  const success = (
    <div className="state-panel">
      <strong>Role submitted</strong>
      <span>Your job is now queued for review.</span>
      <Button onClick={onClose}>Done</Button>
    </div>
  );
  const firstStep = (
    <>
      <h3>Define the role</h3>
      <Input
        label="Job title"
        value={form.title}
        onChange={update('title')}
        required
      />
      <Input
        label="Location"
        value={form.location}
        onChange={update('location')}
        required
      />
      <Button
        onClick={() => setStep(2)}
        disabled={!form.title || !form.location}
      >
        Continue
      </Button>
    </>
  );
  const secondStep = (
    <>
      <h3>Set the terms</h3>
      <div className="wizard-fields">
        <Input
          label="Workplace"
          value={form.workplaceType}
          onChange={update('workplaceType')}
          placeholder="Remote, hybrid, or onsite"
        />
        <Input
          label="Employment type"
          value={form.employmentType}
          onChange={update('employmentType')}
          placeholder="Full-time or contract"
        />
        <Input
          label="Minimum salary"
          type="number"
          value={form.salaryMin}
          onChange={update('salaryMin')}
        />
        <Input
          label="Maximum salary"
          type="number"
          value={form.salaryMax}
          onChange={update('salaryMax')}
        />
      </div>
      <div className="wizard-actions">
        <Button variant="ghost" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button
          onClick={() => setStep(3)}
          disabled={!form.workplaceType || !form.employmentType}
        >
          Continue
        </Button>
      </div>
    </>
  );
  const thirdStep = (
    <>
      <h3>Add the details</h3>
      <Input
        label="Description"
        value={form.description}
        onChange={update('description')}
        placeholder="Describe the impact, responsibilities, and requirements"
      />
      <div className="wizard-actions">
        <Button variant="ghost" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button loading={state.status === 'loading'} onClick={submit}>
          Publish role
        </Button>
      </div>
      {state.error && (
        <span className="ui-field-error" role="alert">
          {state.error}
        </span>
      )}
    </>
  );
  const content =
    state.status === 'succeeded'
      ? success
      : step === 1
        ? firstStep
        : step === 2
          ? secondStep
          : thirdStep;
  return (
    <Modal open={open} onClose={onClose} title="Post a new role">
      <div className="wizard">
        <span className="wizard-step">Step {step} of 3</span>
        {content}
      </div>
    </Modal>
  );
}
