import { useEffect, useRef } from 'react'

interface CldUploadWidgetProps {
    uploadPreset: string
    options?: any
    cloudName: string
    onSuccess?: (result: any) => void
    children: (props: { open: () => void }) => React.ReactNode
}

const CldUploadWidget = ({ uploadPreset, options, cloudName, onSuccess, children }: CldUploadWidgetProps) => {
    const widget = useRef<any>(null)
    const onSuccessRef = useRef(onSuccess)

    // Keep onSuccess up to date without triggering effect
    useEffect(() => {
        onSuccessRef.current = onSuccess
    }, [onSuccess])

    useEffect(() => {
        // Check if the script is loaded
        if (!(window as any).cloudinary) return

        widget.current = (window as any).cloudinary.createUploadWidget(
            {
                cloudName,
                uploadPreset,
                ...options,
            },
            (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    onSuccessRef.current?.(result)
                }
            }
        )
        // Stringify options to prevent re-initialization on every render if options is an inline object
        // Use cloudName and uploadPreset as they are primitives
    }, [cloudName, uploadPreset, JSON.stringify(options)])

    const open = () => {
        if (widget.current) {
            widget.current.open()
        }
    }

    return <>{children({ open })}</>
}

export default CldUploadWidget