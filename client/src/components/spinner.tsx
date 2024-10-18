export function Spinner() {
    return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
        </div>
    )
}

export function InlineSpinner() {
    return (
        <div className="flex inline-block justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
        </div>
    )
}