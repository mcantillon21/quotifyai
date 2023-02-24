interface Props {
    name: string;
    accept: string;
    className?: string;
    disabled?: boolean;
    id: string;
    onChange: (file: FileList | null) => void;
    children?: any;
}

export const FileInput = ({ name, accept, id, onChange, className = "", disabled = false, children }: Props) => {
    return (
        <div style={{ position: "relative", display: "inline-block" }} className={className}>
            {children}
            <input
                type="file"
                name={name}
                id={id}
                onChange={(evt) => onChange(evt.target.files)}
                disabled={disabled}
                accept={accept}
                style={{
                    position: "absolute",
                    top: 0,
                    display: "hidden",
                    left: 0,
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1,
                }}
            />
        </div>
    );
};