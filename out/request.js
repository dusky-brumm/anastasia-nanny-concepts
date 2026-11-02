export function formatRequest({name,contact,message}) {
  const lines=['Здравствуйте, Анастасия!','',`Меня зовут ${name.trim()}.`,`Связаться со мной: ${contact.trim()}.`];
  if(message.trim())lines.push('','О нашей семье:',message.trim());
  return lines.join('\n');
}
