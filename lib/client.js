// dsh-pair-quick client half (hand-written, no bundler).
// Renders the "快速配对" settings section; the button fetches the host
// loopback route /api/pair-quick/mint and shows the QR image + link.
window.__ModuleLoader__.load({
  id: 'dsh-pair-quick',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    const React = require('react')

    function PairQuickPage() {
      const [state, setState] = React.useState({ phase: 'idle' })

      const mint = async () => {
        setState({ phase: 'loading' })
        try {
          const response = await window.fetch('/api/pair-quick/mint', { method: 'POST' })
          const data = await response.json()
          if (data && data.ok) {
            setState({ phase: 'ready', url: data.url, expiresAt: data.expiresAt, qr: data.qr })
          } else {
            setState({ phase: 'error', error: (data && data.error) || '铸造失败' })
          }
        } catch (error) {
          setState({ phase: 'error', error: String((error && error.message) || error) })
        }
      }

      const cardStyle = {
        border: '1px solid var(--border-color, rgba(128,128,128,0.25))',
        borderRadius: 10,
        padding: 16,
        maxWidth: 420,
      }
      const btnStyle = {
        padding: '8px 18px',
        borderRadius: 8,
        border: '1px solid rgba(128,128,128,0.3)',
        cursor: 'pointer',
        background: 'var(--accent-color, #4a7af0)',
        color: '#fff',
      }
      const children = []
      children.push(React.createElement('p', { key: 'h', style: { fontWeight: 600 } }, '快速获取远程访问配对链接'))
      children.push(
        React.createElement(
          'p',
          { key: 'd', style: { color: 'var(--text-secondary, #888)', marginTop: 4 } },
          '点击按钮铸造新链接，手机扫码即可配对（链接 10 分钟内有效）。',
        ),
      )
      if (state.phase === 'ready') {
        children.push(
          React.createElement('img', {
            key: 'qr',
            src: state.qr,
            alt: '配对二维码',
            style: { width: 220, height: 220, marginTop: 12, display: 'block' },
          }),
        )
        children.push(
          React.createElement('input', {
            key: 'url',
            readOnly: true,
            value: state.url,
            style: {
              width: '100%',
              marginTop: 10,
              padding: 8,
              borderRadius: 6,
              border: '1px solid rgba(128,128,128,0.3)',
              background: 'transparent',
              color: 'inherit',
              fontSize: 12,
            },
          }),
        )
        children.push(
          React.createElement(
            'p',
            { key: 'x', style: { color: 'var(--text-secondary, #888)', fontSize: 12, marginTop: 6 } },
            '有效期至 ' + new Date(state.expiresAt).toLocaleTimeString(),
          ),
        )
      } else if (state.phase === 'error') {
        children.push(
          React.createElement('p', { key: 'e', style: { color: '#e05555', fontSize: 12 } }, '出错：' + String(state.error)),
        )
      } else if (state.phase === 'loading') {
        children.push(React.createElement('p', { key: 'l', style: { color: 'var(--text-secondary, #888)' } }, '铸造中…'))
      }
      children.push(
        React.createElement(
          'button',
          { key: 'b', style: btnStyle, disabled: state.phase === 'loading', onClick: mint },
          state.phase === 'loading' ? '请稍候…' : '获取配对链接',
        ),
      )
      return React.createElement('div', { style: cardStyle }, children)
    }

    const apply = (ctx) => {
      const slots = ctx.get('slots')
      if (slots === undefined) return
      slots.inject('settings.section', () =>
        slots.register(
          { name: 'settings.section', id: 'pair-quick', order: 14, label: '快速配对' },
          () => React.createElement(PairQuickPage, null),
        ),
      )
    }

    exports.apply = apply
    exports.inject = []
    return module.exports
  },
})
