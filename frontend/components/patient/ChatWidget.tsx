'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Bot, User } from 'lucide-react'
import type { PatientChatMessage } from '@/types/patient-booking'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [messages, setMessages] = useState<PatientChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Xin chào! Mình là trợ lý y tế số MediBook. Mình có thể giúp gì cho bạn hôm nay? (Ví dụ: "Làm thế nào để đặt lịch?", "Danh sách bác sĩ tim mạch?", "Vị trí bệnh viện?")',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputValue, setInputValue] = useState<string>('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMsg: PatientChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    const currentInput = inputValue
    setInputValue('')

    setTimeout(() => {
      let replyText =
        'Cảm ơn câu hỏi của bạn. Để đặt lịch khám với bác sĩ, bạn chỉ cần chọn bác sĩ phù hợp trong danh bạ bên dưới và bấm nút "Đặt lịch ngay"!'
      const text = currentInput.toLowerCase()

      if (text.includes('đặt lịch') || text.includes('hướng dẫn') || text.includes('bước')) {
        replyText =
          'Đặt lịch khám cực kỳ dễ dàng với 4 bước:\n1. Chọn bác sĩ phù hợp\n2. Chọn ngày & khung giờ khám\n3. Điền thông tin cá nhân\n4. Lựa chọn thanh toán và nhận mã QR!'
      } else if (text.includes('tim mạch')) {
        replyText =
          'Khoa Tim mạch hiện có nhiều bác sĩ uy tín đang nhận bệnh nhân. Bạn có thể lọc theo chuyên khoa Tim mạch trên trang chủ để xem danh sách!'
      } else if (text.includes('giá') || text.includes('chi phí')) {
        replyText =
          'Chi phí khám tại MediBook dao động từ 250.000đ đến 500.000đ tùy cấp bậc bác sĩ. Bạn sẽ thấy chi tiết giá trước khi xác nhận!'
      } else if (text.includes('địa chỉ') || text.includes('ở đâu')) {
        replyText =
          'MediBook liên kết với các bệnh viện hàng đầu tại:\n- Hà Nội\n- TP. Hồ Chí Minh\n- Đà Nẵng'
      } else if (text.includes('thanh toán') || text.includes('momo') || text.includes('vnpay')) {
        replyText =
          'Chúng tôi hỗ trợ thanh toán qua VNPay, Ví MoMo và chuyển khoản ngân hàng bảo mật!'
      } else if (text.includes('xin chào') || text.includes('hello') || text.includes('hi')) {
        replyText = 'Xin chào! Trợ lý MediBook rất vui được hỗ trợ bạn. Bạn cần tư vấn gì ạ?'
      }

      const botMsg: PatientChatMessage = {
        id: 'msg-bot-' + Date.now(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMsg])
    }, 850)
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-primary text-white rounded-full clinical-shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-sm relative outline-none cursor-pointer border-none ripple-effect"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }}>
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }}>
              <MessageSquare className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-primary text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg border border-outline-variant/30 whitespace-nowrap pointer-events-none hidden md:block">
            Tư vấn đặt lịch trực tuyến
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-32px)] h-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/20 flex flex-col"
          >
            <div className="bg-primary text-white p-5 flex items-center gap-3 shadow-md">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Trợ lý Y tế MediBook</h4>
                <p className="text-[10px] text-white/80 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Sẵn sàng hỗ trợ 24/7
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-lowest">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                      msg.sender === 'user' ? 'bg-primary/10 text-primary' : 'bg-primary text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <div
                      className={`p-3 rounded-2xl text-xs whitespace-pre-line leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/20'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span
                      className={`text-[10px] text-on-surface-variant/70 mt-1 ${
                        msg.sender === 'user' ? 'text-right' : ''
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-outline-variant/20 bg-white flex gap-2">
              <input
                type="text"
                placeholder="Nhập nội dung câu hỏi..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-surface-container-low text-xs border border-outline-variant/35 rounded-xl px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all py-3"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm cursor-pointer border-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
