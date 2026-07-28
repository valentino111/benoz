export default function VideoPreviewButton({
  className = '',
  label,
  onActivate,
  playing = false,
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={playing}
      className={`video-preview-trigger${playing ? ' is-playing' : ''}${className ? ` ${className}` : ''}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onActivate?.();
      }}
      type="button"
    >
      <span aria-hidden="true" className="video-preview-icon" />
    </button>
  );
}
