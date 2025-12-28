import React from 'react'

const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="w-full border-t border-border mt-12">
      <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        © {year} Elijah Ahianyo. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
