"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { searchIdeasByTitle, submitIdea } from "@/lib/feedbackApi";
import type { Category, DuplicateCheckResponse, Idea } from "@/types/idea";
import { DuplicateWarning } from "./DuplicateWarning";

type SubmitIdeaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newIdea: Idea) => void;
  categories: Category[];
  listHref?: string;
};

const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 255;
const DESCRIPTION_MAX_LENGTH = 5000;

export function SubmitIdeaModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  listHref = "/ideas",
}: SubmitIdeaModalProps) {
  const duplicateCheckIdRef = useRef(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateCheckResponse["duplicates"]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const canSubmit = useMemo(
    () =>
      trimmedTitle.length >= TITLE_MIN_LENGTH &&
      trimmedTitle.length <= TITLE_MAX_LENGTH &&
      description.length <= DESCRIPTION_MAX_LENGTH &&
      !isSubmitting,
    [description.length, isSubmitting, trimmedTitle.length],
  );

  useEffect(() => {
    if (!isOpen || trimmedTitle.length < 2) {
      return;
    }

    const currentCheckId = ++duplicateCheckIdRef.current;
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsCheckingDuplicates(true);
        const result = await searchIdeasByTitle(trimmedTitle);
        if (duplicateCheckIdRef.current === currentCheckId) {
          setDuplicates(result.duplicates);
        }
      } catch {
        if (duplicateCheckIdRef.current === currentCheckId) {
          setDuplicates([]);
        }
      } finally {
        if (duplicateCheckIdRef.current === currentCheckId) {
          setIsCheckingDuplicates(false);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, trimmedTitle]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryId((current) => (current === categoryId ? null : categoryId));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (trimmedTitle.length < TITLE_MIN_LENGTH) {
      setValidationError(`Title must be at least ${TITLE_MIN_LENGTH} characters long.`);
      return;
    }
    if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      setValidationError(`Title must be ${TITLE_MAX_LENGTH} characters or fewer.`);
      return;
    }
    if (description.length > DESCRIPTION_MAX_LENGTH) {
      setValidationError(`Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`);
      return;
    }

    try {
      setValidationError(null);
      setIsSubmitting(true);
      const newIdea = await submitIdea({
        title: trimmedTitle,
        description: description.trim() || undefined,
        categoryId: selectedCategoryId,
      });
      onSuccess(newIdea);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit your idea.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" open>
      <div className="modal-box max-w-2xl">
        <h3 className="text-xl font-bold text-base-content">Submit a new idea</h3>
        <p className="mt-1 text-sm text-base-content/60">
          Share the problem, why it matters, and any product area it belongs to.
        </p>

        <form id="submit-idea-form" className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {validationError ? (
            <div role="alert" className="alert alert-warning alert-sm">
              <span>{validationError}</span>
            </div>
          ) : null}
          {submitError ? (
            <div role="alert" className="alert alert-error alert-sm">
              <span>{submitError}</span>
            </div>
          ) : null}

          <div className="form-control">
            <label className="label">
              <span className="label-text inline-flex items-center gap-2 font-medium">
                Title
                {isCheckingDuplicates ? (
                  <span className="loading loading-spinner loading-xs text-base-content/40" />
                ) : null}
              </span>
              <span className="label-text-alt tabular-nums">
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </label>
            <input
              type="text"
              value={title}
              required
              disabled={isSubmitting}
              minLength={TITLE_MIN_LENGTH}
              maxLength={TITLE_MAX_LENGTH}
              placeholder="Summarize the idea in one sentence"
              className="input input-bordered w-full"
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                setValidationError(null);
                setSubmitError(null);
                if (nextTitle.trim().length < 2) {
                  setDuplicates([]);
                  setIsCheckingDuplicates(false);
                }
              }}
            />
          </div>

          <DuplicateWarning duplicates={duplicates} listHref={listHref} />

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description</span>
              <span className="label-text-alt tabular-nums">
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </label>
            <textarea
              value={description}
              disabled={isSubmitting}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder="Describe the workflow or customer problem this idea would solve."
              className="textarea textarea-bordered min-h-32 w-full"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Categories</span>
              <span className="label-text-alt">Optional</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = selectedCategoryId === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`badge badge-lg cursor-pointer transition ${
                      isActive
                        ? "badge-primary"
                        : "badge-outline hover:badge-primary hover:badge-outline"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="submit-idea-form"
            className="btn btn-primary"
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Submitting...
              </>
            ) : (
              "Submit idea"
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
