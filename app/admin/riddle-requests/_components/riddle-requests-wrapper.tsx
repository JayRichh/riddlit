import { RiddleRequestActions } from '@/app/admin/_components/riddle-request-actions'
import { getTeamRiddleRequests } from '@/lib/actions/db/riddle-requests-actions'
import { getUserTeams } from '@/lib/actions/db/teams-actions'
import { Badge } from '@/lib/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card'

export async function RiddleRequestsWrapper() {
  // Get user's teams where they are owners
  const userTeamsResult = await getUserTeams()

  if (!userTeamsResult.isSuccess) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Failed to load teams</p>
      </div>
    )
  }

  const ownerTeams = userTeamsResult.data.filter((team) => team.role === 'owner')

  if (ownerTeams.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="space-y-2 text-center">
          <p className="text-muted-foreground">You don't own any teams</p>
          <p className="text-muted-foreground text-sm">Only team owners can view riddle requests</p>
        </div>
      </div>
    )
  }

  // Get all riddle requests for teams owned by the user
  const allRequests = []

  for (const team of ownerTeams) {
    const requestsResult = await getTeamRiddleRequests(team.id)
    if (requestsResult.isSuccess) {
      allRequests.push(
        ...requestsResult.data.map((request) => ({
          ...request,
          teamName: team.name,
          teamSlug: team.slug,
        })),
      )
    }
  }

  if (allRequests.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="space-y-2 text-center">
          <p className="text-muted-foreground">No riddle requests found</p>
          <p className="text-muted-foreground text-sm">
            When users request riddles for your teams, they'll appear here
          </p>
        </div>
      </div>
    )
  }

  // Group requests by status
  const pendingRequests = allRequests.filter((req) => req.status === 'pending')
  const approvedRequests = allRequests.filter((req) => req.status === 'approved')
  const rejectedRequests = allRequests.filter((req) => req.status === 'rejected')

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Pending Requests</h2>
            <Badge variant="default">{pendingRequests.length}</Badge>
          </div>
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <CardDescription>
                        Team: {request.teamName} • Requested by:{' '}
                        {request.requesterName || 'Unknown'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{request.category}</Badge>
                      <Badge variant="secondary">{request.difficulty}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {request.question}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground text-sm">
                        Requested: {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                      <RiddleRequestActions request={request} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approved Requests */}
      {approvedRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Approved Requests</h2>
            <Badge variant="default">{approvedRequests.length}</Badge>
          </div>
          <div className="grid gap-4">
            {approvedRequests.map((request) => (
              <Card key={request.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <CardDescription>
                        Team: {request.teamName} • Requested by:{' '}
                        {request.requesterName || 'Unknown'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{request.category}</Badge>
                      <Badge variant="secondary">{request.difficulty}</Badge>
                      <Badge variant="default">Approved</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-muted-foreground line-clamp-2 text-sm">{request.question}</p>
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
                      {request.reviewedAt && (
                        <span>Approved: {new Date(request.reviewedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Requests */}
      {rejectedRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Rejected Requests</h2>
            <Badge variant="destructive">{rejectedRequests.length}</Badge>
          </div>
          <div className="grid gap-4">
            {rejectedRequests.map((request) => (
              <Card key={request.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <CardDescription>
                        Team: {request.teamName} • Requested by:{' '}
                        {request.requesterName || 'Unknown'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{request.category}</Badge>
                      <Badge variant="secondary">{request.difficulty}</Badge>
                      <Badge variant="destructive">Rejected</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-muted-foreground line-clamp-2 text-sm">{request.question}</p>
                    {request.rejectionReason && (
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-sm font-medium">Rejection Reason:</p>
                        <p className="text-muted-foreground text-sm">{request.rejectionReason}</p>
                      </div>
                    )}
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <span>Requested: {new Date(request.requestedAt).toLocaleDateString()}</span>
                      {request.reviewedAt && (
                        <span>Rejected: {new Date(request.reviewedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
