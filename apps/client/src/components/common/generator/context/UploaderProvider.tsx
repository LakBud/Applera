import {
  UploaderHandlersContext,
  UploaderStateContext,
  type UploaderHandlers,
  type UploaderState,
} from './UploaderContext';

export function UploaderStateProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: UploaderState;
}) {
  return <UploaderStateContext.Provider value={value}>{children}</UploaderStateContext.Provider>;
}

export function UploaderHandlersProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: UploaderHandlers;
}) {
  return (
    <UploaderHandlersContext.Provider value={value}>{children}</UploaderHandlersContext.Provider>
  );
}
