import Button from "./button";

export default function Dialog(props: {
  title?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="fixed z-10 inset-0 bg-black/30 flex items-center justify-center">
      <div className="rounded-lg bg-neutral-700 text-white/90">
        {props.title && (
          <>
            <div className="p-3 flex justify-between">
              <div className="font-bold">{props.title}</div>

              <div className="w-2" />

              <Button
                onClick={props.onClose}
                className="!p-0 w-6 h-6 bg-transparent hover:bg-white/20 cursor-pointer"
                value="X"
              />
            </div>

            <div className="h-[0.0625rem] bg-white/20" />
          </>
        )}

        <div className="p-3 text-sm">{props.body}</div>

        {props.footer && (
          <>
            <div className="h-[0.0625rem] bg-white/20" />

            <div className="p-3 flex justify-end">{props.footer}</div>
          </>
        )}
      </div>
    </div>
  );
}
