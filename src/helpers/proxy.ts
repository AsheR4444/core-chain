import { AxiosProxyConfig } from "axios"

export const getProxyConfigAxios = (proxy: string): AxiosProxyConfig => {
  proxy = proxy.replace("http://", "")

  const [usernamePassword, serverPort] = proxy.split("@")
  const [username, password] = usernamePassword.split(":")
  const [server, port] = serverPort.split(":")

  const proxyConfig = {
    protocol: proxy.includes("://") ? proxy.split("://")[0] : "http",
    host: server,
    port: Number(port),
    auth: {
      username: username,
      password: password,
    },
  }

  return proxyConfig
}
