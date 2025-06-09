import { Icons } from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { Info, MoreVertical, Phone, Search, Send, Video } from 'lucide-react'
import { useState } from 'react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'student'
  timestamp: Date
  status: 'sent' | 'delivered' | 'read'
}

interface Chat {
  id: string
  student: {
    id: string
    name: string
    avatar: string
    status: 'online' | 'offline'
  }
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
}

export default function MessagesPage() {
  const { toast } = useToast()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      student: {
        id: '1',
        name: 'John Smith',
        avatar: '',
        status: 'online',
      },
      lastMessage: 'Hello, I have a question about the assignment.',
      lastMessageTime: new Date(),
      unreadCount: 2,
    },
    {
      id: '2',
      student: {
        id: '2',
        name: 'Sarah Johnson',
        avatar: '',
        status: 'offline',
      },
      lastMessage: 'Thank you for your help!',
      lastMessageTime: new Date(Date.now() - 3600000),
      unreadCount: 0,
    },
  ])
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello, I have a question about the assignment.',
      sender: 'student',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
    },
    {
      id: '2',
      content: 'Sure, what would you like to know?',
      sender: 'user',
      timestamp: new Date(Date.now() - 3500000),
      status: 'read',
    },
    {
      id: '3',
      content: 'I need help with the math problem.',
      sender: 'student',
      timestamp: new Date(Date.now() - 3400000),
      status: 'read',
    },
  ])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !selectedChat) return

    setIsLoading(true)
    try {
      // TODO: Implement message sending logic
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date(),
        status: 'sent',
      }

      setMessages((prev) => [...prev, newMessage])
      setMessage('')

      // Update last message in chat list
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat
            ? {
                ...chat,
                lastMessage: message,
                lastMessageTime: new Date(),
              }
            : chat
        )
      )

      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground">
            Communicate with your students and manage conversations.
          </p>
        </div>
        <Separator />
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat List */}
          <Card className="col-span-12 lg:col-span-4">
            <CardHeader className="pb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 ${
                        selectedChat === chat.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <Avatar>
                        <AvatarImage src={chat.student.avatar} />
                        <AvatarFallback>
                          {chat.student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {chat.student.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(chat.lastMessageTime)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="col-span-12 lg:col-span-8 flex flex-col">
            {selectedChat ? (
              <>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={
                            chats.find((chat) => chat.id === selectedChat)?.student
                              .avatar
                          }
                        />
                        <AvatarFallback>
                          {chats
                            .find((chat) => chat.id === selectedChat)
                            ?.student.name.split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {
                            chats.find((chat) => chat.id === selectedChat)?.student
                              .name
                          }
                        </CardTitle>
                        <CardDescription>
                          {
                            chats.find((chat) => chat.id === selectedChat)?.student
                              .status
                          }
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Block User</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[calc(100vh-24rem)] p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`flex max-w-[80%] flex-col gap-1 ${
                              msg.sender === 'user'
                                ? 'items-end'
                                : 'items-start'
                            }`}
                          >
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                msg.sender === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(msg.timestamp)}
                              </span>
                              {msg.sender === 'user' && (
                                <span className="text-xs text-muted-foreground">
                                  {msg.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <Separator />
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 p-4"
                  >
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                      {isLoading ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium">No chat selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a chat to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
} 