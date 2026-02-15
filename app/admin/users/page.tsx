import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: { purchasedLeads: true }
            }
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Benutzerverwaltung</h1>
            <p className="text-muted-foreground">Übersicht aller registrierten Firmen und Administratoren.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Benutzer</CardTitle>
                    <CardDescription>Gesamt: {users.length}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Firma / Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rolle</TableHead>
                                <TableHead>Gekaufte Leads</TableHead>
                                <TableHead>Registriert am</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.companyName || "-"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "ADMIN" ? "destructive" : "outline"}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user._count.purchasedLeads}</TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
