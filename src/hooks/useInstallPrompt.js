import { useEffect, useState } from 'react'

const isIosDevice = /iphone|ipad|ipod/i.test(window.navigator.userAgent || '')

function detectStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

// "Add to Home Screen" support: the native prompt on Android/desktop, manual steps on iOS.
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isStandalone, setIsStandalone] = useState(detectStandalone)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    const onAppInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setIsDismissed(true)
  }

  return {
    canInstall: !isStandalone && !isDismissed && (Boolean(deferredPrompt) || isIosDevice),
    hasNativePrompt: Boolean(deferredPrompt),
    isIosDevice,
    install,
    dismiss: () => setIsDismissed(true),
  }
}
