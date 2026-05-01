"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Paperclip, X } from "lucide-react";
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
const DESCRIPTION_MAX_WORDS = 300;

const countWords = (text: string) => {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateCheckResponse["duplicates"]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const wordCount = countWords(description);
  const canSubmit = useMemo(
    () =>
      trimmedTitle.length >= TITLE_MIN_LENGTH &&
      trimmedTitle.length <= TITLE_MAX_LENGTH &&
      description.length <= DESCRIPTION_MAX_LENGTH &&
      wordCount <= DESCRIPTION_MAX_WORDS &&
      !isSubmitting,
    [description.length, isSubmitting, trimmedTitle.length, wordCount],
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
    setSelectedCategoryIds((current) => {
      if (current.includes(categoryId)) {
        return current.filter((id) => id !== categoryId);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, categoryId];
    });
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
    if (wordCount > DESCRIPTION_MAX_WORDS) {
      setValidationError(`Description must be ${DESCRIPTION_MAX_WORDS} words or fewer.`);
      return;
    }

    try {
      setValidationError(null);
      setIsSubmitting(true);
      const newIdea = await submitIdea({
        title: trimmedTitle,
        description: description.trim() || undefined,
        categoryId: selectedCategoryIds[0] || null,
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
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`} open={isOpen}>
      <div className="modal-box absolute right-0 top-0 m-0 h-full max-h-screen w-full max-w-[500px] rounded-none !scale-100 !translate-y-0 p-8 shadow-2xl overflow-y-auto">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-6 top-6 border border-base-300 text-base-content/50 hover:border-base-400 hover:text-base-content"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="mt-2 text-2xl font-bold text-base-content">Tell us your Idea!</h3>

        <form id="submit-idea-form" className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
            <div className="relative">
              <input
                type="text"
                value={title}
                required
                disabled={isSubmitting}
                minLength={TITLE_MIN_LENGTH}
                maxLength={TITLE_MAX_LENGTH}
                placeholder="One sentence that summarizes your Idea"
                className="input input-bordered w-full pr-10"
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
              {isCheckingDuplicates ? (
                <span className="loading loading-spinner loading-xs absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50" />
              ) : null}
            </div>
          </div>

          <DuplicateWarning duplicates={duplicates} listHref={listHref} />

          <div className="form-control relative">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="text-xs text-base-content/0"></span>
              <span className={`text-xs tabular-nums ${wordCount > DESCRIPTION_MAX_WORDS ? 'text-error font-bold' : 'text-base-content/50'}`}>
                {wordCount} / {DESCRIPTION_MAX_WORDS} words
              </span>
            </div>
            <textarea
              value={description}
              disabled={isSubmitting}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder="Why your Idea is useful, who would benefit and how it should work?"
              className="textarea textarea-bordered min-h-40 w-full resize-none pb-10"
              onChange={(event) => {
                const nextVal = event.target.value;
                
                // Allow Deletion: always allow backspace/delete
                if (nextVal.length < description.length) {
                  setDescription(nextVal);
                  return;
                }

                // The LogicSplit & Count: On every keystroke, we split the text and count
                const nextWordCount = countWords(nextVal);

                // The "Hard Stop": If word count is > 300 and user is adding text
                if (nextWordCount > DESCRIPTION_MAX_WORDS) {
                  return; // Prevent the update entirely
                }

                setDescription(nextVal);
              }}
            />
            <Paperclip className="absolute bottom-3 right-3 h-4 w-4 text-base-content/40" />
          </div>

          <div className="form-control">
            <label className="label mb-1 px-0">
              <span className="label-text text-base-content/70">
                Choose up to 3 Topics for this Idea
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = selectedCategoryIds.includes(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`btn btn-sm rounded-xl font-normal transition-colors ${
                      isActive
                        ? "btn-primary"
                        : "border-base-300 bg-base-100 text-base-content hover:border-base-400 hover:bg-base-200"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        <div className="modal-action mt-8 border-t border-base-200 pt-6">
          <button
            type="submit"
            form="submit-idea-form"
            className="btn btn-primary ml-auto"
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Submitting...
              </>
            ) : (
              "Submit Idea"
            )}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
